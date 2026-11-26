import type { Request, Response } from "express";
import database from "../../database";
import type { components } from "@logchimp/api-ts-types";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type { GetPostStatement } from "../../middlewares/postExists";
import { invalidateBoardCache } from "../../ee/services/boards/invalidateCache";

export async function deleteById(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["DeletePostByIdRequestBody"]
  >,
  res: Response<components["schemas"]["GenericAPIErrorResponseBody"]>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  // @ts-expect-error
  const post = req.post as GetPostStatement;

  const id = validUUID(req.body.id);

  const checkPermission = permissions.includes("post:destroy");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    await database.delete().from("posts").where({
      postId: id,
    });

    await invalidateBoardCache([post?.boardId]);

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
