import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TGetSiteSettingsLabResponseBody,
  TUpdateSiteSettingsLabResponseBody,
} from "@logchimp/types";
// database
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

//cache
import * as cache from "../../cache";
import { CACHE_KEYS } from "../../cache/keys";
import { DAY } from "../../cache/time";

type ResponseBody = TGetSiteSettingsLabResponseBody | IApiErrorResponse;

export async function getLabs(_: Request, res: Response<ResponseBody>) {
  if (cache.isActive) {
    try {
      const cached = await cache.valkey.get(CACHE_KEYS.LABS_SETTINGS);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).send({
          labs: JSON.parse(cached),
        });
      }
    } catch (err) {
      logger.error({ message: err });
    }
  }

  try {
    const results = (await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first()) as unknown as TUpdateSiteSettingsLabResponseBody;

    const labs = results.labs;
    if (cache.isActive) {
      try {
        await cache.valkey.set(
          CACHE_KEYS.LABS_SETTINGS,
          JSON.stringify(labs),
          "EX",
          7 * DAY,
        );
        res.setHeader("X-Cache", "MISS");
      } catch (err) {
        logger.error({ message: err });
      }
    }

    res.status(200).send({
      labs: results.labs,
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
