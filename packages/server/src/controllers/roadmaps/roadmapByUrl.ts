import type { Response } from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  IGetRoadmapByUrlResponseBody,
  IApiErrorResponse,
  IRoadmapPrivate,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../../express";
import { z } from "zod";

//cache
import * as cache from "../../cache";
import { DAY } from "../../cache/time";
import logger from "../../utils/logger";

const ParamsSchema = z.object({
  url: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "URL must be alphanumeric with dashes only"),
});

export async function roadmapByUrl(
  req: ExpressRequestContext<IGetRoadmapByUrlRequestParam>,
  res: Response<IGetRoadmapByUrlResponseBody | IApiErrorResponse>,
) {
  const parseResult = ParamsSchema.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: parseResult.error.issues,
    });
  }

  const { url } = parseResult.data;
  const cacheKey = `roadmaps:url:${url.toLowerCase()}`;
  if (cache.isActive) {
    try {
      const cached = await cache.valkey.get(cacheKey);
      if (cached) {
        const roadmap : IRoadmapPrivate = JSON.parse(cached);
        return res.status(200).send({ roadmap });
      }
    } catch (err) {
      logger.error({
        message: "Cache read failed",
        error: err,
      });
    }
  }

  const roadmap = req.ctx.roadmap;

  if (roadmap && cache.isActive) {
    try {
      await cache.valkey.set(cacheKey, JSON.stringify(roadmap), "EX", DAY * 7);
    } catch (err) {
      logger.error({
        message: "Cache write failed",
        error: err,
      });
    }
  }

  res.status(200).send({ roadmap });
}
