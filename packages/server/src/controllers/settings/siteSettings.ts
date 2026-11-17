import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { WorkspaceService } from "../../services/workspace";
import type { IAuthenticationMiddlewareUser } from "../../types";

type ResponseBody =
  | components["schemas"]["GetSiteSettingsResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

const workspace = new WorkspaceService();

export async function siteSettings(req: Request, res: Response<ResponseBody>) {
  try {
    // @ts-expect-error `req.user` is added by the auth middleware
    const user = req?.user as IAuthenticationMiddlewareUser | undefined;
    const settings = await workspace.GetSettings(user);

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
