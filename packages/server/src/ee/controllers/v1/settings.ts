import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { WorkspaceService } from "../../services/workspace";
import type { IAuthenticationMiddlewareUser } from "../../../types";
import type { ILicenseGuardMiddleware } from "../../types";

type GetSiteSettingsResponseBody =
  | components["schemas"]["GetSiteSettingsResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

const workspace = new WorkspaceService();

export async function getSiteSettings(
  req: Request,
  res: Response<GetSiteSettingsResponseBody>,
) {
  try {
    // @ts-expect-error `req.user` is added by the auth middleware
    const user = req?.user as IAuthenticationMiddlewareUser | undefined;
    // @ts-expect-error `req.subscription` is added by the license middleware
    const subscription = req?.subscription as
      | ILicenseGuardMiddleware
      | undefined;
    const settings = await workspace.GetSettings(user, subscription);

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
