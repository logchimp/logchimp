import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ISortRoadmapRequestBody,
  TPermission,
  TSortRoadmapResponseBody,
} from "@logchimp/types";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

//cache
import * as cache from "../../../../cache/index";

type ResponseBody = TSortRoadmapResponseBody | IApiErrorResponse;

export async function sort(
  req: Request<unknown, unknown, ISortRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  const { from, to } = req.body;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  if (from.id === to.id) {
    return res.status(204).send();
  }

  try {
    // to
    await database
      .update({
        index: to.index,
      })
      .from("roadmaps")
      .where({
        id: to.id,
      });

    // from
    await database
      .update({
        index: from.index,
      })
      .from("roadmaps")
      .where({
        id: from.id,
      });

    //invalidating cache when roadmap sorts
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

    res.sendStatus(200);
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
