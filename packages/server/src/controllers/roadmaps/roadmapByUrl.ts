import type { Response } from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  IGetRoadmapByUrlResponseBody,
  IApiErrorResponse,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../../express";

//cache
import * as cache from "../../cache/index";
import { DAY } from "../../cache/time";
import logger from "../../utils/logger";

export async function roadmapByUrl(
  req: ExpressRequestContext<IGetRoadmapByUrlRequestParam>,
  res: Response<IGetRoadmapByUrlResponseBody | IApiErrorResponse>,
) {
  const cacheKey = `roadmaps:url:${req.params.url}`;
  if (cache.isActive) {
    try {
      const cached = await cache.valkey.get(cacheKey);
      if (cached) {
        const roadmap = JSON.parse(cached);
        return res.status(200).send({ roadmap });
      }
    } catch (err) {
      logger.error({
        message: "Cache read failed",
        err,
      });
    }
  }

  const roadmap = req.ctx.roadmap;

  if (roadmap && cache.isActive) {
    try {
      await cache.valkey.set(cacheKey, JSON.stringify(roadmap), "EX", DAY * 7);
    } catch (err) {
      logger.error({
        message: err,
      });

      return res.status(500).send({
        message: err.general.serverError,
        code: "SERVER_ERROR",
      });
    }
  }

  res.status(200).send({ roadmap });
}
