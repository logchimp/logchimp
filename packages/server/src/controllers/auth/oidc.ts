import type { Request, Response } from "express";

import { OIDCService } from "../../services/auth/oidc.service";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type { IApiErrorResponse } from "@logchimp/types";

type OIDCLoginResponse = IApiErrorResponse;

export async function OIDCLogin(
  _req: Request,
  res: Response<OIDCLoginResponse>,
) {
  const oidcService = new OIDCService();

  try {
    const { authorizationUrl } = await oidcService.CreateAuthorizationUrl();

    res.redirect(authorizationUrl.href);
  } catch (err) {
    logger.error({
      message: "Failed to start OIDC authentication.",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
