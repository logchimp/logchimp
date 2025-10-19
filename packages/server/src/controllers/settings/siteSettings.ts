import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetSiteSettingsResponseBody,
  ISiteSettings,
} from "@logchimp/types";

import database from "../../database";
import { checkLicense } from "../../ee/services/license/checkLicense";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = IGetSiteSettingsResponseBody | IApiErrorResponse;

export async function siteSettings(_: Request, res: Response<ResponseBody>) {
  try {
    const settings = await database<ISiteSettings>("settings")
      .select("*", database.raw("labs::json as labs"))
      .first();

    const hasValidLicense = await checkLicense();

    res.status(200).send({
      settings: {
        ...settings,
        hasValidLicense,
      },
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
