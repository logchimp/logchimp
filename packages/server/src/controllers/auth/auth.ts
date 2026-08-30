import type { Request, Response } from "express";
import type { IApiErrorResponse, IAuthMeResponseBody } from "@logchimp/types";
import { getUserById } from "../../repository/user";
import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type GetMeResponseBody = IAuthMeResponseBody | IApiErrorResponse;

export async function me(req: Request, res: Response<GetMeResponseBody>) {
  // @ts-expect-error
  const userId = req.user.userId;

  try {
    const user = await getUserById(database, userId);

    res.status(200).send({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
        // @ts-expect-error
        permissions: req.user.permissions,
      },
    });
  } catch (err) {
    logger.error({
      message: "Failed to get user by ID",
      error: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
