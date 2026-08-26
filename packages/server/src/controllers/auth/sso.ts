import type { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";
import * as cache from "../../cache";
import crypto from "node:crypto";
import type {
  ILogChimpIdentityCodeExchangeQuery,
  IApiErrorResponse,
  ILogChimpIdentityAuthenticationQuery,
  ILogChimpIdentityAuthenticationResponseBody,
} from "@logchimp/types";
import { config } from "../../utils/logchimpConfig";
import { getSafeURI } from "../../helpers";
import { AuthenticationFailedError } from "../../services/auth/errors";
import logger from "../../utils/logger";

export async function logchimpIdentityCodeExchange(
  req: Request<unknown, unknown, unknown, ILogChimpIdentityCodeExchangeQuery>,
  res: Response<IApiErrorResponse>,
) {
  // ?redirect_uri=
  const redirectUri = req.query.redirect_uri.toString();

  const allowedRedirectURIs = getSafeURI(
    (config.ssoLogChimpIdentityAllowedRedirectURI || "").trim(),
  );
  if (!allowedRedirectURIs.has(redirectUri)) {
    res.status(400).send({
      message: "Invalid redirect URI",
      code: "INVALID_REDIRECT_URI",
    });
    return;
  }

  // ?token=
  const token = (req.query.token.toString() || "").trim();
  if (!token) {
    res.redirect(`${redirectUri}?code=INVALID_TOKEN`);
    return;
  }

  const authService = new AuthService();
  const user = await authService.GenerateLogChimpIdentityExchangeCode(token);

  const onetimeCode = crypto.randomUUID();

  await cache.valkey.set(
    `sso:logchimp:${onetimeCode}`,
    JSON.stringify({
      userId: user.userId,
      email: user.email,
    }),
    "EX",
    60,
  );

  res.redirect(`${redirectUri}?code=${onetimeCode}`);
}

type LogChimpIdentityAuthenticationResponse =
  | ILogChimpIdentityAuthenticationResponseBody
  | IApiErrorResponse;

export async function logchimpIdentityAuthentication(
  req: Request<unknown, unknown, unknown, ILogChimpIdentityAuthenticationQuery>,
  res: Response<LogChimpIdentityAuthenticationResponse>,
) {
  const code = (req.query?.code || "").toString().trim();
  if (!code) {
    res.status(403).send({
      message: "Invalid code provided",
      code: "INVALID_CODE",
    });
    return;
  }

  try {
    const authService = new AuthService();
    const user = await authService.LogChimpIdentityAuthentication(code);

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
        message: "Invalid code provided",
        code: "INVALID_CODE",
      });
      return;
    }

    logger.error({
      message: "Failed to authenticate LogChimp identity",
      err,
    });

    res.status(500).send({
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
