import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  ICreatePostEERequestBody,
  ICreatePostResponseBody,
  IFilterPostRequestBody,
  IFilterPostRequestQueryParams,
  IGetPostBySlugRequestBody,
  IGetPostBySlugResponseBody,
  IPost,
  IUpdatePostEERequestBody,
  TPermission,
  TUpdatePostResponseBody,
} from "@logchimp/types";
import * as v from "valibot";
import database from "../../../../database";
import {
  generateNanoID as nanoid,
  validUUID,
  validUUIDs,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import type { GetPostStatement } from "../../../../middlewares/postExists";
import { postsQueue } from "../../../worker/tasks/posts";
import xss from "xss";
import {
  bodySchema,
  type FilterPostResponseBody,
  querySchema as filterPostQuerySchema,
  schemaBodyErrorMap,
  schemaQueryErrorMap,
} from "../../../../controllers/post/filterPost";
import { BoardRepository } from "../../../repository/board";
import { RoadmapRepository } from "../../../repository/roadmap";
import { VoteRepository } from "../../../../repository/vote";
import { UserRepository } from "../../../../repository/user";
import { valkey } from "../../../../cache";
import { updatePostEERequestBodySchema } from "./schema";
import { POST_TITLE_MAX_LENGTH } from "../../../../constants";
import { v4 as uuidv4 } from "uuid";
import { getVotes } from "../../../../services/votes/getVotes";
import { createPostEERequestBodySchema } from "./schema";

const userRepository = new UserRepository(database, valkey);
const boardRepository = new BoardRepository(database, valkey);
const roadmapRepository = new RoadmapRepository(database, valkey);
const voteRepository = new VoteRepository(database, valkey);

const filterPostBodySchema = v.object({
  ...bodySchema.entries,
  boardId: v.optional(
    v.pipe(
      v.array(v.string()),
      v.transform((value) => (Array.isArray(value) ? validUUIDs(value) : [])),
    ),
  ),
  roadmapId: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => validUUID(value)),
    ),
  ),
});

export async function filterPost(
  req: Request<
    unknown,
    unknown,
    IFilterPostRequestBody,
    IFilterPostRequestQueryParams
  >,
  res: Response<FilterPostResponseBody>,
) {
  if (req.body?.page || req.body?.limit) {
    logger.warn(
      "Offset-based pagination is deprecated and will be removed in next major release. Please migrate to cursor pagination instead.",
    );
  }

  const query = v.safeParse(filterPostQuerySchema, req.query);
  if (!query.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.issues.map((issue) => ({
        ...issue,
        message: schemaQueryErrorMap[issue.message]
          ? schemaQueryErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const body = v.safeParse(filterPostBodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: schemaBodyErrorMap[issue.message]
          ? schemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const { page, limit, boardId, roadmapId, query: searchQuery } = body.output;
  const { first: _first, after, created } = query.output;

  const first = page ? (limit ?? _first) : _first;
  if (after && !validUUID(after)) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid cursor format",
    });
    return;
  }

  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  const escapedQuery = (searchQuery || "").replace(/[\\%_]/g, "\\$&");

  try {
    const response = await buildPostsQuery({
      first,
      page,
      after,
      created,
      boardId: boardId || [],
      roadmapId,
      query: escapedQuery,
    });

    if (page && response.length === 0) {
      res.status(200).json({
        status: { code: 200, type: "success" },
        posts: [],
        results: [],
      });
      return;
    }

    const authorIds = new Set<string>();
    const boardIDs = new Set<string>();
    const roadmapIDs = new Set<string>();
    const voterIDs = new Set<string>();

    for (const post of response) {
      authorIds.add(post.userId);
      voterIDs.add(post.postId);
      if (post.boardId) {
        boardIDs.add(post.boardId);
      }
      if (post.roadmap_id) {
        roadmapIDs.add(post.roadmap_id);
      }
    }

    const [authors, boards, roadmaps, votes] = await Promise.all([
      userRepository.GetUserPublicInfo([...authorIds]),
      boardRepository.GetPublicBoardByIDs([...boardIDs]),
      roadmapRepository.GetPublicRoadmapByIDs([...roadmapIDs]),
      voteRepository.GetVotesByPostIDs([...voterIDs], userId),
    ]);

    // Enrich posts with board, roadmap, and votes
    const posts: IPost[] = [];
    for (const post of response) {
      const author = authors.find((author) => author.userId === post.userId);
      const board = boards.find((board) => board.boardId === post.boardId);
      const roadmap = roadmaps.find(
        (roadmap) => roadmap.id === post.roadmap_id,
      );
      const voters = votes.get(post.postId);

      post.userId = undefined;
      post.boardId = undefined;
      post.roadmap_id = undefined;

      posts.push({
        ...post,
        author: author,
        board: board ?? null,
        roadmap: roadmap ?? null,
        voters: voters,
      });
    }

    const postDataLength = posts.length;

    let startCursor: string | null = null;
    let endCursor: string | null = null;

    if (!page) {
      startCursor = postDataLength > 0 ? String(posts[0].postId) : null;
      endCursor =
        postDataLength > 0 ? String(posts[postDataLength - 1].postId) : null;
    }

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;

    if (!page) {
      const metadataResults = await getPostMetadata({
        after,
        query: escapedQuery,
        boardId,
        roadmapId,
        created,
      });
      if (metadataResults) {
        totalCount = metadataResults.totalCount;
        totalPages = Math.ceil(metadataResults.totalCount / first);
        hasNextPage = metadataResults.remainingResultsCount - first > 0;

        if (after) {
          const seenResults =
            totalCount - metadataResults.remainingResultsCount;
          currentPage = Math.floor(seenResults / first) + 1;
        }
      }
    }

    res.status(200).send({
      status: {
        code: 200,
        type: "success",
      },
      posts,
      results: posts,
      ...(page
        ? {}
        : {
            page_info: {
              count: postDataLength,
              current_page: currentPage,
              has_next_page: hasNextPage,
              end_cursor: endCursor,
              start_cursor: startCursor,
            },
            total_pages: totalPages,
            total_count: totalCount,
          }),
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

async function buildPostsQuery({
  first,
  page,
  after,
  created,
  boardId,
  roadmapId,
  query = "",
}: {
  first: number;
  page?: number;
  after?: string;
  created: "ASC" | "DESC";
  boardId: string[];
  roadmapId?: string | null;
  query?: string;
}) {
  let queryBuilder = database("posts").select(
    "postId",
    "title",
    "slug",
    "userId",
    "boardId",
    "roadmap_id",
    "contentMarkdown",
    "createdAt",
    "updatedAt",
  );

  // Apply filters
  if (query.length > 0) {
    queryBuilder = queryBuilder.where("title", "ILIKE", `%${query}%`);
  }
  if (boardId.length > 0) {
    queryBuilder = queryBuilder.whereIn("boardId", boardId);
  }
  if (roadmapId) {
    queryBuilder = queryBuilder.where("roadmap_id", roadmapId);
  }

  if (page) {
    queryBuilder = queryBuilder.offset(first * (page - 1));
  } else if (after) {
    // Fetch the cursor post's createdAt timestamp
    const cursorPost = await database("posts")
      .select("createdAt")
      .where("postId", "=", after)
      .first();

    if (cursorPost) {
      if (created === "DESC") {
        queryBuilder = queryBuilder.where((builder) => {
          builder
            .where("createdAt", "<", cursorPost.createdAt)
            .orWhere((subBuilder) => {
              subBuilder
                .where("createdAt", "=", cursorPost.createdAt)
                .where("postId", "<", after);
            });
        });
      } else {
        queryBuilder = queryBuilder.where((builder) => {
          builder
            .where("createdAt", ">", cursorPost.createdAt)
            .orWhere((subBuilder) => {
              subBuilder
                .where("createdAt", "=", cursorPost.createdAt)
                .where("postId", ">", after);
            });
        });
      }
    }
  }

  queryBuilder = queryBuilder
    .orderBy("createdAt", created)
    .orderBy("postId", created)
    .limit(first);

  return queryBuilder;
}

async function getPostMetadata({
  after,
  query = "",
  boardId = [] as string[],
  roadmapId,
  created = "DESC",
}: {
  after?: string;
  query?: string;
  boardId?: string[];
  roadmapId?: string | null;
  created?: "ASC" | "DESC";
}) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("posts").count("* as count");

    if (query.length > 0) {
      totalCountQuery.where("title", "ILIKE", `%${query}%`);
    }
    if (boardId.length > 0) {
      totalCountQuery.whereIn("boardId", boardId);
    }
    if (roadmapId) {
      totalCountQuery.where("roadmap_id", roadmapId);
    }

    const totalCountResult = await totalCountQuery.first();

    // Remaining results after cursor
    let remainingQuery = trx("posts").as("next");

    if (query.length > 0) {
      remainingQuery = remainingQuery.where("title", "ILIKE", `%${query}%`);
    }
    if (boardId.length > 0) {
      remainingQuery = remainingQuery.whereIn("boardId", boardId);
    }
    if (roadmapId) {
      remainingQuery = remainingQuery.where("roadmap_id", roadmapId);
    }

    if (after) {
      const cursorPost = await trx("posts")
        .select("createdAt")
        .where("postId", "=", after)
        .first();

      if (cursorPost) {
        if (created === "DESC") {
          remainingQuery = remainingQuery.where((builder) => {
            builder
              .where("createdAt", "<", cursorPost.createdAt)
              .orWhere((subBuilder) => {
                subBuilder
                  .where("createdAt", "=", cursorPost.createdAt)
                  .where("postId", "<", after);
              });
          });
        } else {
          remainingQuery = remainingQuery.where((builder) => {
            builder
              .where("createdAt", ">", cursorPost.createdAt)
              .orWhere((subBuilder) => {
                subBuilder
                  .where("createdAt", "=", cursorPost.createdAt)
                  .where("postId", ">", after);
              });
          });
        }
      }
    }

    const remainingResult = await trx
      .count("* as count")
      .from(remainingQuery)
      .first();

    const totalCount = Number.parseInt(String(totalCountResult.count), 10);
    const remainingResultsCount = Number.parseInt(
      String(remainingResult.count),
      10,
    );

    return { totalCount, remainingResultsCount };
  });
}

type CreatePostResponseBody =
  | ICreatePostResponseBody
  | IApiErrorResponse
  | IApiValidationErrorResponse;

const createPostSchemaBodyErrorMap = {};

export async function createPost(
  req: Request<unknown, unknown, ICreatePostEERequestBody>,
  res: Response<CreatePostResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const body = v.safeParse(createPostEERequestBodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: createPostSchemaBodyErrorMap[issue.message]
          ? createPostSchemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  let title = body.output.title;
  let contentMarkdown = xss(body.output.contentMarkdown);

  if (title.length > POST_TITLE_MAX_LENGTH) {
    const exceedingText = title.slice(POST_TITLE_MAX_LENGTH - 3);
    title = `${title.slice(0, POST_TITLE_MAX_LENGTH - 3)}...`;

    contentMarkdown = `...${exceedingText}${contentMarkdown ? `\n\n${contentMarkdown}` : ""}`;
  }

  const checkPermission = permissions.includes("post:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  // generate slug unique identification
  const slugId = nanoid(20);

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const createPost = await database
      .insert({
        postId: uuidv4(),
        title,
        slug,
        slugId,
        contentMarkdown,
        userId,
        boardId: body.output.boardId,
      })
      .into("posts")
      .returning("*");

    const post = createPost[0];

    await database
      .insert({
        voteId: uuidv4(),
        userId,
        postId: post.postId,
      })
      .into("votes");

    res.status(201).send({
      post,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

type UpdatePostResponseBody = TUpdatePostResponseBody | IApiErrorResponse;

const updatePostSchemaBodyErrorMap = {
  POST_TITLE_MISSING: error.api.posts.titleMissing,
};

export async function updatePost(
  req: Request<unknown, unknown, IUpdatePostEERequestBody>,
  res: Response<UpdatePostResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  // @ts-expect-error
  const postId = (req.post as GetPostStatement).postId;
  // @ts-expect-error
  const authorId = (req.post as GetPostStatement).userId;
  // @ts-expect-error
  const slugId = (req.post as GetPostStatement).slugId;
  // @ts-expect-error
  const currentBoardId = (req.post as GetPostStatement).boardId;
  // @ts-expect-error
  const currentRoadmapId = (req.post as GetPostStatement).roadmap_id;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const body = v.safeParse(updatePostEERequestBodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: updatePostSchemaBodyErrorMap[issue.message]
          ? updatePostSchemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const hasBoardId = Object.hasOwn(body.output, "boardId");
  const newBoardId = hasBoardId ? validUUID(req.body.boardId) : undefined;

  const hasRoadmapId = Object.hasOwn(body.output, "roadmapId");
  const newRoadmapId = hasRoadmapId ? validUUID(req.body.roadmapId) : undefined;

  const { title: rawTitle, contentMarkdown: rawContentMarkdown } = body.output;
  const title = xss((String(rawTitle) || "").trim());
  const contentMarkdown = xss(String(rawContentMarkdown || "").trim()) || null;

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const posts = await database
      .update({
        title,
        slug,
        contentMarkdown,
        ...(hasBoardId ? { boardId: newBoardId } : {}),
        ...(hasRoadmapId ? { roadmap_id: newRoadmapId } : {}),
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId,
      })
      .returning("*");

    if (
      // NOTE: Skip notifying users if roadmap is removed/empty
      newRoadmapId &&
      body.output.roadmap?.notifyVoters &&
      currentRoadmapId !== newRoadmapId
    ) {
      try {
        await postsQueue.postRoadmapChangeEvent({
          postId,
        });
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
    }

    if (hasBoardId && newBoardId !== currentBoardId) {
      const boardIds = [currentBoardId, newBoardId].filter(
        (boardId): boardId is string => Boolean(boardId),
      );
      await boardRepository.InvalidateBoardCache(boardIds, [
        "private",
        "detail",
      ]);
    }

    const post = posts[0];
    res.status(200).send({ post });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

type PostBySlugResponseBody = IGetPostBySlugResponseBody | IApiErrorResponse;

export async function postBySlug(
  req: Request<unknown, unknown, IGetPostBySlugRequestBody>,
  res: Response<PostBySlugResponseBody>,
) {
  // @ts-expect-error
  const post = req.post;
  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  try {
    const author = await database
      .select("userId", "name", "username", "avatar")
      .from("users")
      .where({
        userId: post.userId,
      })
      .first();

    const voters = await getVotes(post.postId, userId);

    const board = await database
      .select("boardId", "name", "url", "color", "createdAt")
      .from("boards")
      .where({
        boardId: post.boardId,
      })
      .first();

    const roadmap = await database
      .select("id", "name", "url", "color")
      .from("roadmaps")
      .where({
        id: post.roadmap_id,
      })
      .first();

    post.boardId = undefined;
    post.userId = undefined;
    post.roadmap_id = undefined;

    res.status(200).send({
      post: {
        board,
        author,
        roadmap,
        ...post,
        voters,
      },
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
