import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRoadmapPrivate,
  ISearchRoadmapRequestParam,
  ISearchRoadmapResponseBody,
  TPermission,
} from "@logchimp/types";

//database
import database from "../../database";

import * as cache from "../../cache";
import { DAY } from "../../cache/time";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = ISearchRoadmapResponseBody | IApiErrorResponse;

export async function searchRoadmap(
  req: Request<ISearchRoadmapRequestParam>,
  res: Response<ResponseBody>,
) {
  const { name } = req.params;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const cacheKey = `roadmaps:search:${name.toLowerCase()}`;

  try {
    if (cache.isActive) {
      try {
        const cachedRoadmaps = await cache.valkey.get(cacheKey);
        if (cachedRoadmaps) {
          const roadmaps : IRoadmapPrivate[] = JSON.parse(cachedRoadmaps);
          return res.status(200).send({ roadmaps });
        }
      } catch (err) {
        logger.error({
          message: "Cache hit failed",
          error: err,
        });
      }
    }

    const roadmaps = await database<IRoadmapPrivate>("roadmaps")
      .select()
      .where("name", "ILIKE", `${name}%`);

    if (cache.isActive && roadmaps) {
      try {
        await cache.valkey.set(
          cacheKey,
          JSON.stringify(roadmaps),
          "EX",
          DAY * 7,
        );
      } catch (err) {
        logger.error({
          message: "Cache write failed",
          error: err,
        });
      }
    }

    res.status(200).send({
      roadmaps,
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
