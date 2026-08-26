import type { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";
import * as cache from "../../cache";
import crypto from "node:crypto";
import type {
  IApiErrorResponse,
  ILogChimpIdentityCodeExchangeQuery,
} from "@logchimp/types";
import { config } from "../../utils/logchimpConfig";
import { getSafeURI } from "../../helpers";

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
