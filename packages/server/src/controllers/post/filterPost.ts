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
import {
  parseAndValidateLimit,
  parseAndValidatePage,
  validUUID,
} from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { GET_POSTS_FILTER_COUNT } from "../../constants";
import { UserRepository } from "../../repository/user";
import { VoteRepository } from "../../repository/vote";
import { valkey } from "../../cache";

const userRepository = new UserRepository(database, valkey);
const voteRepository = new VoteRepository(database, valkey);

export const querySchema = v.object({
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

export const bodySchema = v.object({
  /**
   * @deprecated Use `first` and `after` instead.
   * For backward compatibility to support offset pagination.
   * Will be removed in the next major release.
   */
  page: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) => parseAndValidatePage(value)),
    ),
  ),
  /**
   * @deprecated Use `first` and `after` instead.
   * For backward compatibility to support offset pagination.
   * Will be removed in the next major release.
   */
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((value) =>
        parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT),
      ),
    ),
  ),
});

export const schemaQueryErrorMap = {
  INVALID_CURSOR: error.general.invalidCursor,
  MIN_VALUE_1: error.general.minValue1,
};

export const schemaBodyErrorMap = {};

export type FilterPostResponseBody =
  | IFilterPostResponseBody
  | IApiErrorResponse;

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

  const { page, limit } = body.output;
  const { first: _first, after, created } = query.output;

  const first = _first ?? limit ?? GET_POSTS_FILTER_COUNT;
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
    const voterIDs = new Set<string>();

    for (const post of response) {
      authorIds.add(post.userId);
      voterIDs.add(post.postId);
    }

    const authors = await userRepository.GetUserPublicInfo([...authorIds]);
    const votes = await voteRepository.GetVotesByPostIDs([...voterIDs], userId);

    // Enrich posts with votes
    const posts: IPost[] = [];
    for (const post of response) {
      try {
        const author = authors.find((author) => author.userId === post.userId);
        const voters = votes.get(post.postId);

        post.userId = undefined;

        posts.push({
          ...post,
          author,
          board: null,
          roadmap: null,
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
}: {
  first: number;
  page?: number;
  after?: string;
  created: "ASC" | "DESC";
}) {
  let queryBuilder = database("posts").select(
    "postId",
    "title",
    "slug",
    "userId",
    "contentMarkdown",
    "createdAt",
    "updatedAt",
  );

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
  created = "DESC",
}: {
  after?: string;
  created?: "ASC" | "DESC";
}) {
  return database.transaction(async (trx) => {
    // Total count
    const totalCountQuery = trx("posts").count("* as count");

    const totalCountResult = await totalCountQuery.first();

    // Remaining results after cursor
    let remainingQuery = trx("posts").as("next");

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
