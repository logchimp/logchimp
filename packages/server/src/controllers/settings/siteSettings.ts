import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetSiteSettingsResponseBody,
  ISiteSettings,
} from "@logchimp/types";
// database
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

// cache
import { valkey, isActive } from "../../cache/index";
import { CACHE_KEYS } from "../../cache/keys";
import { DAY } from "../../cache/time";

type ResponseBody = IGetSiteSettingsResponseBody | IApiErrorResponse;

export async function siteSettings(_: Request, res: Response<ResponseBody>) {
  if (isActive && valkey) {
    try {
      const cached = await valkey.get(CACHE_KEYS.SITE_SETTINGS);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).send({ settings: JSON.parse(cached) });
      }
    } catch (err) {
      logger.log({ level: "error", message: err });
    }
  }

  try {
    const settings = await database<ISiteSettings>("settings")
      .select("*", database.raw("labs::json as labs"))
      .first();

    if (isActive && valkey) {
      await valkey.set(
        CACHE_KEYS.SITE_SETTINGS,
        JSON.stringify(settings),
        "EX",
        7 * DAY,
      );
      res.setHeader("X-Cache", "MISS");
    }

    res.status(200).send({
      settings,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
