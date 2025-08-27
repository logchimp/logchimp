import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetUsersRequestQuery,
  IGetUsersResponseBody,
} from "@logchimp/types";
import database from "../../database";

// services
import { getUsers } from "../../services/users/getUsers";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { GET_USERS_FILTER_COUNT } from "../../constants";
import { parseAndValidateLimit, parseAndValidatePage } from "../../helpers";

type ResponseBody = IGetUsersResponseBody | IApiErrorResponse;

export async function filter(
  req: Request<unknown, unknown, unknown, IGetUsersRequestQuery>,
  res: Response<ResponseBody>,
) {
  const created = req.query.created;
  const limit = parseAndValidateLimit(req.query?.limit, GET_USERS_FILTER_COUNT);
  const page = parseAndValidatePage(req.query?.page);

  try {
    const userData = await getUsers(created, limit, page);

    const users = [];

    for (let i = 0; i < userData.length; i++) {
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
