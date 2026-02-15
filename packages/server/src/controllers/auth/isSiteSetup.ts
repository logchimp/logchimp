import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetSiteSetupResponseBody,
} from "@logchimp/types";

// database
import database from "../../database";

// cache
import * as cache from "../../cache/";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { CACHE_KEYS } from "../../cache/keys";

type ResponseBody = IGetSiteSetupResponseBody | IApiErrorResponse;

export async function isSiteSetup(_: Request, res: Response<ResponseBody>) {
  const cacheKey = CACHE_KEYS.SITE_SETUP;

  if (cache.isActive) {
    try {
      const cachedSiteSetup = await cache.valkey.get(cacheKey);
      if (cachedSiteSetup) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).send({
          is_setup: true,
        });
      }
    } catch (err) {
      logger.log({
        level: "error",
        message: err,
      });
    }
  }

  try {
    const isSetup = await database
      .select<{
        userId: string;
      }>("userId")
      .from("users")
      .where({
        isOwner: true,
      })
      .first();

    const is_setup: boolean = typeof isSetup !== "undefined";

    if (cache.isActive) {
      if (is_setup) {
        try {
          await cache.valkey.set(cacheKey, "true");
        } catch (err) {
          logger.log({
            level: "error",
            message: err,
          });
        }
      }

      res.setHeader("X-Cache", "MISS");
    }

    res.status(200).send({
      is_setup,
    });
  } catch (err) {
    logger.error({
      message: err.message,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
