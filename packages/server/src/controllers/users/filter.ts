import type { Request, Response } from "express";
import { z } from "zod";
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
import { parseAndValidateLimit } from "../../helpers";

const querySchema = z.object({
  first: z.coerce
    .string()
    .transform((value) => parseAndValidateLimit(value, GET_USERS_FILTER_COUNT)),
  after: z.uuid().optional(),
  created: z.enum(["ASC", "DESC"]).default("ASC"),
});

type ResponseBody = IGetUsersResponseBody | IApiErrorResponse;

export async function filter(
  req: Request<unknown, unknown, unknown, IGetUsersRequestQuery>,
  res: Response<ResponseBody>,
) {
  const query = querySchema.safeParse(req.query);

  try {
    const { first, after, created } = query.data;
    const userData = await getUsers({ first, after, created });
    const userDataLength = userData.length;

    const startCursor = userDataLength > 0 ? String(userData[0].userId) : null;
    const endCursor =
      userDataLength > 0 ? String(userData[userDataLength - 1].userId) : null;

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;
    const metadataResults = await getUserMetadata({
      after,
    });
    if (metadataResults) {
      totalCount = metadataResults.totalCount;
      totalPages = Math.ceil(metadataResults.totalCount / first);
      hasNextPage = metadataResults.remainingResultsCount - first > 0;

      if (after) {
        const seenResults = totalCount - metadataResults.remainingResultsCount;
        currentPage = Math.floor(seenResults / first) + 1;
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
      page_info: {
        count: userDataLength,
        current_page: currentPage,
        has_next_page: hasNextPage,
        end_cursor: endCursor,
        start_cursor: startCursor,
      },
      total_pages: totalPages,
      total_count: totalCount,
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
