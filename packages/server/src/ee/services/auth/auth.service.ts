import validator from "validator";

export class DomainBlacklistManager {
  /**
   * Make public only for unit tests.
   * Instead, use isBlacklisted method
   */
  domains: Set<string> = new Set();

  constructor() {
    const blacklist = process.env.LOGCHIMP_BLACKLISTED_DOMAINS || "";
    this.parse(blacklist);
  }

  public reset(): void {
    this.domains = new Set();
    const blacklist = process.env.LOGCHIMP_BLACKLISTED_DOMAINS || "";
    this.parse(blacklist);
  }

  /**
   * Is this provided email address blacklisted?
   * @param email
   */
  public isBlacklisted(email: string) {
    const e = email.trim().toLowerCase();
    if (e.length === 0) return true;
    const atIndex = e.lastIndexOf("@");
    if (atIndex === -1) return true;
    const domain = e.slice(atIndex + 1);
    return this.domains.has(domain);
  }

  public parse(rawDomains: string) {
    this.domains = new Set();
    if (!rawDomains || typeof rawDomains !== "string") return;

    rawDomains.split(",").forEach((domain) => {
      const d = domain.trim().toLowerCase();
      if (!d) return;
      if (validator.isFQDN(d)) {
        this.domains.add(d);
      }
    });
  }
}

export const domainBlacklistManager = new DomainBlacklistManager();
