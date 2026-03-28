import type { Request, Response } from "express";
import * as v from "valibot";
import type {
  IApiErrorResponse,
  IGetUsersRequestQuery,
  IGetUsersResponseBody,
} from "@logchimp/types";
import database from "../../database";

// services
import { getUsers, getUserMetadata } from "../../services/users/getUsers";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { GET_USERS_FILTER_COUNT } from "../../constants";
import { parseAndValidateLimit, parseAndValidatePage } from "../../helpers";
import type { IAuthenticationMiddlewareUser } from "../../types";

const querySchema = v.object({
  first: v.pipe(
    v.optional(v.string(), GET_USERS_FILTER_COUNT.toString()),
    v.transform((value) =>
      parseAndValidateLimit(value, GET_USERS_FILTER_COUNT),
    ),
    v.number(),
    v.minValue(1, "MIN_VALUE_1"),
  ),
  /**
   * For backward compatibility to support offset pagination,
   * will be removed in the next major release.
   */
  page: v.pipe(
    v.optional(v.string()),
    v.transform((value) => (value ? parseAndValidatePage(value) : undefined)),
  ),
  limit: v.pipe(
    v.optional(v.string(), GET_USERS_FILTER_COUNT.toString()),
    v.transform((value) =>
      parseAndValidateLimit(value, GET_USERS_FILTER_COUNT),
    ),
    v.number(),
    v.minValue(1, "MIN_VALUE_1"),
  ),
  after: v.optional(v.pipe(v.string(), v.uuid("INVALID_CURSOR"))),
  created: v.optional(v.picklist(["ASC", "DESC"]), "ASC"),
});

const schemaQueryErrorMap = {
  INVALID_CURSOR: error.general.invalidCursor,
  MIN_VALUE_1: error.general.minValue1,
};

type ResponseBody = IGetUsersResponseBody | IApiErrorResponse;

export async function filter(
  req: Request<unknown, unknown, unknown, IGetUsersRequestQuery>,
  res: Response<ResponseBody>,
) {
  if (req.query?.page || req.query?.limit) {
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
  const { first: _first, page, after, created, limit } = query.output;
  const first = req.query?.limit ? limit : _first;

  // @ts-expect-error
  const { isOwner } = req.user as IAuthenticationMiddlewareUser;
  if (!isOwner) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const userData = await getUsers({ first, page, after, created });
    const userDataLength = userData.length;

    let startCursor: string | null = null;
    let endCursor: string | null = null;
    if (!page) {
      startCursor = userDataLength > 0 ? String(userData[0].userId) : null;
      endCursor =
        userDataLength > 0 ? String(userData[userDataLength - 1].userId) : null;
    }

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;
    if (!page) {
      const metadataResults = await getUserMetadata({
        after,
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

    const users = [];

    for (let i = 0; i < userDataLength; i++) {
      const userId = userData[i].userId;

      try {
        const postsCount = await database
          .count()
          .from("posts")
          .where({ userId });
        const votesCount = await database
          .count()
          .from("votes")
          .where({ userId });
        const roles = await database
          .select({
            id: "roles.id",
            name: "roles.name",
            isSystem: "roles.is_system",
            // user role ID
            user_role_id: "roles_users.role_id",
          })
          .from("roles_users")
          .innerJoin("roles", "roles.id", "roles_users.role_id")
          .where({
            user_id: userId,
          });

        users.push({
          votes: votesCount[0].count,
          posts: postsCount[0].count,
          roles,
          ...userData[i],
        });
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
    }

    res.status(200).send({
      status: {
        code: 200,
        type: "success",
      },
      users,
      results: users,
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
