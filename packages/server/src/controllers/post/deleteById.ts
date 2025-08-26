import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IDeletePostByIdRequestBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function deleteById(
  req: Request<unknown, unknown, IDeletePostByIdRequestBody>,
  res: Response<IApiErrorResponse>,
) {
  // @ts-ignore
  const permissions = req.user.permissions;

  const id = validUUID(req.body.id);

  const checkPermission = permissions.includes("post:destroy");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    await database.delete().from("posts").where({
      postId: id,
    });

    res.sendStatus(204);
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
