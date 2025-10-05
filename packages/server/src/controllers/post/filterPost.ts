import type { Request, Response } from "express";
import * as v from "valibot";
import type {
  IApiErrorResponse,
  IFilterPostRequestBody,
  IFilterPostRequestQueryParams,
  IFilterPostResponseBody,
  IPost,
} from "@logchimp/types";
import database from "../../database";

// services
import { getBoardById } from "../../ee/services/boards/getBoardById";
import { getVotes } from "../../services/votes/getVotes";

// utils
import {
  parseAndValidateLimit,
  parseAndValidatePage,
  validUUID,
  validUUIDs,
} from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { GET_POSTS_FILTER_COUNT } from "../../constants";

const querySchema = v.object({
  first: v.pipe(
    v.optional(v.string(), GET_POSTS_FILTER_COUNT.toString()),
    v.transform((value) =>
      parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT),
    ),
    v.number(),
    v.minValue(1, "MIN_VALUE_1"),
  ),
  after: v.optional(v.pipe(v.string(), v.uuid("INVALID_CURSOR"))),
  created: v.optional(v.picklist(["ASC", "DESC"]), "DESC"),
});

const bodySchema = v.object({
  page: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => parseAndValidatePage(value)),
    ),
  ),
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) =>
        parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT),
      ),
    ),
  ),
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

const schemaQueryErrorMap = {
  INVALID_CURSOR: error.general.invalidCursor,
  MIN_VALUE_1: error.general.minValue1,
};

const schemaBodyErrorMap = {};

type ResponseBody = IFilterPostResponseBody | IApiErrorResponse;

export async function filterPost(
  req: Request<
    unknown,
    unknown,
    IFilterPostRequestBody,
    IFilterPostRequestQueryParams
  >,
  res: Response<ResponseBody>,
) {
  if (req.body?.page || req.body?.limit) {
    logger.warn(
      "Offset-based pagination is deprecated and will be removed in next major release. Please migrate to cursor pagination instead.",
    );
  }

  const query = v.safeParse(querySchema, req.query);
  if (!query.success) {
    return res.status(400).json({
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
  }

  const body = v.safeParse(bodySchema, req.body);
  if (!body.success) {
    return res.status(400).json({
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
  }

  const { page, limit, boardId, roadmapId } = body.output;
  const { first: _first, after, created } = query.output;

  const first = _first || limit;
  if (after && !validUUID(after)) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid cursor format",
    });
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

    // Enrich posts with board, roadmap, and votes
    const posts: IPost[] = [];
    for (const post of response) {
      try {
        const board = await getBoardById(post.boardId);
        const voters = await getVotes(post.postId, userId);
        const roadmap = await database
          .select("id", "name", "url", "color")
          .from("roadmaps")
          .where({ id: post.roadmap_id })
          .first();

        posts.push({
          ...post,
          board,
          roadmap,
          voters,
        });
      } catch (err) {
        logger.log({ level: "error", message: err });
      }
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
    "boardId",
    "roadmap_id",
    "contentMarkdown",
    "createdAt",
    "updatedAt",
  );

  // Apply filters
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
