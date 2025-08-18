import logger from "./logger";

function isValidDomain(domain: string) {
  if (typeof domain !== "string") return false;

  const trimmed = domain.trim().toLowerCase();

  if (trimmed.length === 0 || trimmed.length > 255) return false;

  const domainRegex =
    /^(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

  if (!domainRegex.test(trimmed)) {
    return false;
  }
  return true;
}

const parseBlacklistedDomains = (rawDomains: string) => {
  const result = new Set();

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

const getBlacklistedDomains = () =>
  parseBlacklistedDomains(process.env.LOGCHIMP_BLACKLISTED_DOMAINS);

const isDomainBlacklisted = (email: string) => {
  if (typeof email !== "string") return false;

  const trimmedEmail = email.trim();

  const parts = trimmedEmail.split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1].trim().toLowerCase();

  if (!isValidDomain(domain)) return false;

  return getBlacklistedDomains().has(domain);
};

export { isDomainBlacklisted, parseBlacklistedDomains, isValidDomain };
