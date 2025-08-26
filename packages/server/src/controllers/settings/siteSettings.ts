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

type ResponseBody = IGetSiteSettingsResponseBody | IApiErrorResponse;

export async function siteSettings(_: Request, res: Response<ResponseBody>) {
  try {
    const settings = await database<ISiteSettings>("settings")
      .select("*", database.raw("labs::json as labs"))
      .first();

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
