import type { Request, Response } from "express";

import { OIDCService } from "../../services/auth/oidc.service";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import type {
  IApiErrorResponse,
  ILogChimpOpenIDConnectLoginCallbackResponseBody,
} from "@logchimp/types";
import { config } from "../../utils/logchimpConfig";
import { AuthService } from "../../services/auth/auth.service";
import { AuthenticationFailedError } from "../../services/auth/errors";

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

type OIDCLoginCallbackResponse =
  | ILogChimpOpenIDConnectLoginCallbackResponseBody
  | IApiErrorResponse;

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

  try {
    const user = await oidcService.Authenticate(currentUrl, oidcState);

    const authToken = authService.generateUserAuthToken(
      user.userId,
      user.email,
    );

    res.status(200).send({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
        authToken,
      },
    });
  } catch (err) {
    if (err instanceof AuthenticationFailedError) {
      res.status(403).send({
        message: "Authentication failed",
        code: "AUTHENTICATION_FAILED",
      });
      return;
    }

    logger.error({
      message: "Failed to authenticate using OpenID Connect",
      err,
    });

    res.status(500).send({
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
