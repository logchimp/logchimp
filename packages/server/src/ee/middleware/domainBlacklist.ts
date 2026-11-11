import type { NextFunction, Request, Response } from "express";
import validator from "validator";
import error from "../../errorResponse.json";
import { validEmail } from "../../helpers";
import { domainBlacklistManager } from "../services/auth/auth.service";

export function domainBlacklist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // @ts-expect-error - `req.user` is not typed in Express Request by default
  const rawEmail = req.body?.email || req.user?.email || "";
  const email = (typeof rawEmail === "string" ? rawEmail : "")
    .trim()
    .toLowerCase();

  if (!validEmail(email)) {
    res.status(400).json({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
    return;
  }

  if (domainBlacklistManager.isBlacklisted(email)) {
    res.status(403).send({
      message: error.api.authentication.emailDomainBlacklisted,
      code: "EMAIL_DOMAIN_BLACKLISTED",
    });
    return;
  }

  next();
}
