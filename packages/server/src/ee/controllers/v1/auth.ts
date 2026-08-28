import type { Request, Response } from "express";
import { config } from "../../../utils/logchimpConfig";
import { OIDCService } from "../../../services/auth/oidc.service";
import { AuthService } from "../../../services/auth/auth.service";
import { AuthenticationFailedError } from "../../../services/auth/errors";
import logger from "../../../utils/logger";
import type { IApiErrorResponse } from "@logchimp/types";

type OIDCLoginCallbackResponse = IApiErrorResponse;

export async function OIDCLoginCallback(
  req: Request,
  res: Response<OIDCLoginCallbackResponse>,
) {
  const oidcState = (req.query.state.toString() || "").trim();
  if (!oidcState) {
    res.status(403).send({
      message: "Invalid OIDC transaction",
      code: "INVALID_OIDC_TRANSACTION",
    });
    return;
  }

  const currentUrl = new URL(config.apiUrl + req.originalUrl);

  const oidcService = new OIDCService();
  const authService = new AuthService();

  const redirectURI = new URL(`${config.webUrl}/oauth/logchimp`);

  try {
    const user = await oidcService.Authenticate(currentUrl, oidcState);

    const authToken = authService.generateUserAuthToken(
      user.userId,
      user.email,
    );

    const webURL = new URL(config.webUrl);
    res.cookie("lc-auth-token", authToken, {
      domain: webURL.hostname,
      secure: true,
      // 10 minutes
      path: "/oauth/logchimp",
      maxAge: 1000 * 60 * 10,
      sameSite: "none",
    });

    res.redirect(redirectURI.toString());
  } catch (err) {
    if (err instanceof AuthenticationFailedError) {
      redirectURI.searchParams.set("error", "not_allowed");
      res.redirect(redirectURI.toString());
      return;
    }

    logger.error({
      message: "Failed to authenticate using OpenID Connect",
      error: err,
    });

    res.status(500).send({
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
