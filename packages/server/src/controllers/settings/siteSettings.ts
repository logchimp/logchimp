import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { workspaceRepository } from "../../repository/workspace";

type ResponseBody =
  | components["schemas"]["GetSiteSettingsResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

const workspace = new workspaceRepository();

export async function siteSettings(_: Request, res: Response<ResponseBody>) {
  try {
    const settings = await workspace.GetSettings();

    res.status(200).send({
      settings: {
        ...settings,
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
