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

type ResponseBody = TGetSiteSettingsLabResponseBody | IApiErrorResponse;

export async function getLabs(_: Request, res: Response<ResponseBody>) {
  try {
    const results = (await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first()) as unknown as TUpdateSiteSettingsLabResponseBody;

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
