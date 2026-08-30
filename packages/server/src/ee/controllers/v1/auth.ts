import type { Request, Response } from "express";
import { config } from "../../../utils/logchimpConfig";
import { OIDCService } from "../../../services/auth/oidc.service";
import { AuthService } from "../../../services/auth/auth.service";
import {
  AuthenticationFailedError,
  OIDCAuthenticationFailedError,
} from "../../../services/auth/errors";
import logger from "../../../utils/logger";
import type { IApiErrorResponse, IUserInfo } from "@logchimp/types";

type OIDCLoginCallbackResponse = IApiErrorResponse;

export async function OIDCLoginCallback(
  req: Request,
  res: Response<OIDCLoginCallbackResponse>,
) {
  const redirectURI = new URL(`${config.webUrl}/oauth/logchimp`);

  const stateParam = req.query.state;
  const oidcState = typeof stateParam === "string" ? stateParam.trim() : "";
  if (!oidcState) {
    redirectURI.searchParams.set("error", "invalid_state");
    res.redirect(redirectURI.toString());
    return;
  }

  const currentUrl = new URL(config.apiUrl + req.originalUrl);

  const oidcService = new OIDCService();
  const authService = new AuthService();

  try {
    let user: IUserInfo;
    try {
      user = await oidcService.Authenticate(currentUrl, oidcState);
    } catch (err) {
      if (err instanceof OIDCAuthenticationFailedError) {
        redirectURI.searchParams.set("error", err.code);
        res.redirect(redirectURI.toString());
        return;
      }
      throw err;
    }

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
