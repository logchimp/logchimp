import type { Request, Response } from "express";
import { z } from "zod";
import type {
  IApiErrorResponse,
  IFilterPostRequestBody,
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

const querySchema = z.object({
  first: z.coerce
    .string()
    .transform((value) => parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT)),
  page: z.coerce
    .string()
    .optional()
    .transform((value) => (value ? parseAndValidatePage(value) : undefined)),
  limit: z.coerce
    .string()
    .optional()
    .transform((value) => parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT)),
  after: z.uuid().optional(),
  created: z.enum(["ASC", "DESC"]).default("DESC"),
});

type ResponseBody = IFilterPostResponseBody | IApiErrorResponse;

export async function filterPost(
  req: Request<unknown, unknown, IFilterPostRequestBody>,
  res: Response<ResponseBody>,
) {
  if (req.query?.page || req.query?.limit) {
    logger.warn(
      "Offset-based pagination is deprecated and will be removed in next major release. Please migrate to cursor pagination instead.",
    );
  }

  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.error.issues,
    });
  }

  const { first: _first, page, after, created, limit } = query.data;
  const first = req.query?.limit ? limit : _first;

  const boardId = validUUIDs(req.body.boardId || []);
  const roadmapId = validUUID(req.body.roadmapId);
  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  try {
    const response = await buildPostsQuery({
      first,
      page,
      after,
      created,
      boardId,
      roadmapId,
    });

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

    const metadata = await getPostMetadata({ after, boardId, roadmapId });
    const totalCount = metadata.totalCount;
    const totalPages = Math.ceil(totalCount / first);
    const userDataLength = posts.length;

    const startCursor = userDataLength > 0 ? String(posts[0].postId) : null;
    const endCursor =
      userDataLength > 0 ? String(posts[userDataLength - 1].postId) : null;

    const hasNextPage = metadata.remainingResultsCount - first > 0;
    const currentPage = page ?? 1;

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
              count: userDataLength,
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

  // Apply cursor if exists
  if (after) {
    const cursorPost = await database("posts")
      .select("createdAt")
      .where({ postId: after })
      .first();

    if (cursorPost) {
      queryBuilder = queryBuilder.where(
        "createdAt",
        created === "ASC" ? ">" : "<",
        cursorPost.createdAt,
      );
    }
  }

  queryBuilder = queryBuilder.orderBy("createdAt", created);

  if (after) {
    queryBuilder = queryBuilder.limit(first).offset(1);
  } else {
    const offset = page ? first * (page - 1) : 0;
    queryBuilder = queryBuilder.limit(first).offset(offset);
  }

  return queryBuilder;
}

async function getPostMetadata({
  after,
  boardId = [] as string[],
  roadmapId,
}: {
  after?: string;
  boardId?: string[];
  roadmapId?: string | null;
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
      remainingQuery = remainingQuery
        .where(
          "createdAt",
          ">=",
          trx("posts").select("createdAt").where("postId", "=", after),
        )
        .offset(1);
    }

    const remainingResult = await trx
      .count("* as count")
      .from(remainingQuery)
      .first();

    const totalCount = Number(totalCountResult?.count || 0);
    const remainingResultsCount = Number(remainingResult?.count || 0);

    return { totalCount, remainingResultsCount };
  });
}
