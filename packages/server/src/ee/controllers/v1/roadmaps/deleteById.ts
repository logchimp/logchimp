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

//cache
import * as cache from "../../../../cache/index";

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

    //invalidating cache when roadmap deletes
    try {
      const searchKeys = await cache.valkey.keys("roadmaps:search:*");
      const urlKeys = await cache.valkey.keys("roadmaps:url:*");
      if (searchKeys.length > 0) await cache.valkey.unlink(...searchKeys);
      if (urlKeys.length > 0) await cache.valkey.unlink(...urlKeys);
    } catch (cacheErr) {
      logger.error({
        message: "Failed to invalidate roadmap cache after sort",
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
