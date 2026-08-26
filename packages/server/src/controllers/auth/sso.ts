import type { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";
import * as cache from "../../cache";
import crypto from "node:crypto";
import type { ILogChimpIdentityCodeExchangeQuery } from "@logchimp/types";

export async function logchimpIdentityCodeExchange(
  req: Request<unknown, unknown, unknown, ILogChimpIdentityCodeExchangeQuery>,
  res: Response,
) {
  // ?redirect_uri=
  const redirectUri = req.query.redirect_uri.toString();

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
