import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IFilterPostRequestBody,
  IFilterPostRequestQueryParams,
  IPost,
  IUpdatePostRequestBody,
  TPermission,
  TUpdatePostResponseBody,
} from "@logchimp/types";
import * as v from "valibot";
import database from "../../../../database";
import { validUUID, validUUIDs } from "../../../../helpers";
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
import { GET_POSTS_FILTER_COUNT } from "../../../../constants";

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

  const { page, limit, boardId, roadmapId } = body.output;
  const { first: _first, after, created } = query.output;

  const first = _first ?? limit ?? GET_POSTS_FILTER_COUNT;
  if (after && !validUUID(after)) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid cursor format",
    });
    return;
  }

  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  try {
    const response = await buildPostsQuery({
      first,
      page,
      after,
      created,
      boardId: boardId || [],
      roadmapId,
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

    const authors = await userRepository.GetUserPublicInfo([...authorIds]);
    const boards = await boardRepository.GetPublicBoardByIDs([...boardIDs]);
    const roadmaps = await roadmapRepository.GetPublicRoadmapByIDs([
      ...roadmapIDs,
    ]);
    const votes = await voteRepository.GetVotesByPostIDs([...voterIDs], userId);

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
        board: board,
        roadmap: roadmap,
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
}: {
  first: number;
  page?: number;
  after?: string;
  created: "ASC" | "DESC";
  boardId: string[];
  roadmapId?: string | null;
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

  // console.log("build posts query:");
  // Apply filters
  // console.log("board ID:", boardId);
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
  boardId = [] as string[],
  roadmapId,
  created = "DESC",
}: {
  after?: string;
  boardId?: string[];
  roadmapId?: string | null;
  created?: "ASC" | "DESC";
}) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("posts").count("* as count");

    if (boardId.length > 0) {
      totalCountQuery.whereIn("boardId", boardId);
    }
    if (roadmapId) {
      totalCountQuery.where("roadmap_id", roadmapId);
    }

    const totalCountResult = await totalCountQuery.first();

    // Remaining results after cursor
    let remainingQuery = trx("posts").as("next");

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

type UpdatePostResponseBody = TUpdatePostResponseBody | IApiErrorResponse;

const updatePostBodySchema = v.object({
  title: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "POST_TITLE_MISSING",
  ),
  contentMarkdown: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
  boardId: v.optional(v.nullable(v.string())),
  roadmapId: v.optional(v.nullable(v.string())),
  roadmap: v.optional(
    v.object({
      notifyVoters: v.boolean(),
    }),
  ),
});

const updatePostSchemaBodyErrorMap = {
  POST_TITLE_MISSING: error.api.posts.titleMissing,
};

export async function updatePost(
  req: Request<unknown, unknown, IUpdatePostRequestBody>,
  res: Response<UpdatePostResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  // @ts-expect-error
  const authorId = (req.post as GetPostStatement).userId;
  // @ts-expect-error
  const slugId = (req.post as GetPostStatement).slugId;
  // @ts-expect-error
  const currentRoadmapId = (req.post as GetPostStatement).roadmap_id;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const body = v.safeParse(updatePostBodySchema, req.body);
  if (!body.success) {
    return res.status(400).json({
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
  }

  const id = validUUID(req.body.id);
  const boardId = validUUID(req.body.boardId);

  const hasRoadmapId = Object.prototype.hasOwnProperty.call(
    body.output,
    "roadmapId",
  );
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
        boardId,
        ...(hasRoadmapId ? { roadmap_id: newRoadmapId } : {}),
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId: id,
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
          postId: id,
        });
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
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
