import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import error from "../errorResponse.json";

export function isValidDomain(domain: string) {
  if (typeof domain !== "string") return false;

  const trimmed = domain.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 255) return false;

  const domainRegex =
    /^(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

  return domainRegex.test(trimmed);
}

export const parseBlacklistedDomains = (rawDomains: string) => {
  const result = new Set<string>();

  if (!rawDomains || typeof rawDomains !== "string") return result;

  rawDomains
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .forEach((domain) => {
      if (!domain) return;
      if (!isValidDomain(domain)) {
        logger.warn(`Invalid domain in blacklist config: "${domain}"`);
        return;
      }
      result.add(domain);
    });

  return result;
};

export class BlacklistManager {
  private cachedBlacklist: Set<string> | null = null;

  getBlacklistedDomains(): Set<string> {
    if (this.cachedBlacklist) {
      return this.cachedBlacklist;
    }

    this.cachedBlacklist = parseBlacklistedDomains(
      process.env.LOGCHIMP_BLACKLISTED_DOMAINS || "",
    );

    return this.cachedBlacklist;
  }
  reset(): void {
    this.cachedBlacklist = null;
  }
}

export function domainBlacklist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }

  const parts = email.trim().split("@");
  if (parts.length !== 2) {
    return res.status(400).json({
      message: error.api.authentication.invalidEmailDomain,
      code: "INVALID_EMAIL_FORMAT",
    });
  }

  const domain = parts[1].trim().toLowerCase();

  if (!isValidDomain(domain)) {
    return res.status(400).json({
      message: error.api.authentication.invalidEmailDomain,
      code: "INVALID_EMAIL_DOMAIN",
    });
  }

  const blacklistManager = new BlacklistManager();

  if (blacklistManager.getBlacklistedDomains().has(domain)) {
    return res.status(403).send({
      message: error.api.authentication.emailDomainBlacklisted,
      code: "EMAIL_DOMAIN_BLACKLISTED",
    });
  }

  next();
}
