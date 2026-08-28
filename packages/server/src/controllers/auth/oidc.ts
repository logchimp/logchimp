import type { Request, Response } from "express";

import { OIDCService } from "../../services/auth/oidc.service";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type { IApiErrorResponse } from "@logchimp/types";
import { config } from "../../utils/logchimpConfig";
import { AuthService } from "../../services/auth/auth.service";
import { AuthenticationFailedError } from "../../services/auth/errors";
import {
  computePermissions,
  getUserInfoWithRoles,
} from "../../middlewares/auth/helpers";

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

type OIDCLoginCallbackResponse = IApiErrorResponse;

export async function OIDCLoginCallback(
  req: Request,
  res: Response<OIDCLoginCallbackResponse>,
) {
  const stateParam = req.query.state;
  const oidcState = typeof stateParam === "string" ? stateParam.trim() : "";
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

    if (user.isBlocked) {
      res.status(403).send({
        message: error.middleware.user.userBlocked,
        code: "USER_BLOCK",
      });
      return;
    }

    const getUserWithRoles = await getUserInfoWithRoles(user.userId);
    const permissions = await computePermissions(getUserWithRoles);

    const hasPermissions = Array.isArray(permissions) && permissions.length > 0;
    if (!hasPermissions) {
      res.status(403).send({
        message: error.middleware.auth.accessDenied,
        code: "ACCESS_DENIED",
      });
      return;
    }

    const allowedPermissions = new Set([
      "post:create",
      "vote:create",
      "vote:destroy",
      "comment:create",
      "comment:update:own",
    ]);

    const hasRestrictedPermissions = permissions.some(
      (permission) => !allowedPermissions.has(permission),
    );

    if (hasRestrictedPermissions) {
      redirectURI.searchParams.set("error", "not_allowed");
      res.redirect(redirectURI.toString());
      return;
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
