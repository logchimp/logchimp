import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetUserInfoRequestParams,
  IUserInfo,
  TGetUserInfoResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = TGetUserInfoResponseBody | IApiErrorResponse;

export async function getUserInfo(
  req: Request<IGetUserInfoRequestParams>,
  res: Response<ResponseBody>,
) {
  const { user_id } = req.params;

  try {
    const user = await database<IUserInfo>("users")
      .select(
        "userId",
        "name",
        "username",
        "email",
        "avatar",
        "isVerified",
        "isBlocked",
        "isOwner",
        "notes",
        "createdAt",
      )
      .where({
        userId: user_id,
      })
      .first();

    res.status(200).send({
      user,
    });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
