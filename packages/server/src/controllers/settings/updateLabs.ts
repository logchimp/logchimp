import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TPermission,
  TUpdateSiteSettingsLabRequestBody,
  TUpdateSiteSettingsLabResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

//cache
import * as cache from "../../cache";
import { CACHE_KEYS } from "../../cache/keys";
import { DAY } from "../../cache/time";

type ResponseBody = TUpdateSiteSettingsLabResponseBody | IApiErrorResponse;

/**
 * This API doesn't update the existing labs value
 * instead overrides the existing value with req.body.labs
 */
export async function updateLabs(
  req: Request<unknown, unknown, TUpdateSiteSettingsLabRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const labs = req.body;
  const stringify = JSON.stringify(labs);

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const response = await database
      .update({
        labs: database.raw(`labs::jsonb || '${stringify}'`),
      })
      .from("settings")
      .returning(database.raw("labs::json"));

    if (cache.isActive) {
      try {
        await cache.valkey.set(
          CACHE_KEYS.LABS_SETTINGS,
          JSON.stringify(response[0]),
          "EX",
          7 * DAY,
        );
      } catch (err) {
        logger.error({ message: err });
      }
    }

    const labs = response[0];
    res.status(200).send({
      labs,
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
