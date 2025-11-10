import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IDeleteRoadmapRequestBody,
  TDeleteRoadmapResponseBody,
  TPermission,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import { validUUID } from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

//helpers
import { deleteKeysByPattern } from "../../../../helpers";

type ResponseBody = TDeleteRoadmapResponseBody | IApiErrorResponse;

export async function deleteById(
  req: Request<unknown, unknown, IDeleteRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const id = validUUID(req.body.id);

  const checkPermission = permissions.includes("roadmap:destroy");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    await database.delete().from("roadmaps").where({
      id: id,
    });

    try {
      await deleteKeysByPattern("roadmaps:search:*");
      await deleteKeysByPattern("roadmaps:url:*");
    } catch (cacheErr) {
      logger.error({
        message: "Failed to invalidate roadmap cache after delete",
        error: cacheErr,
      });
    }

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
