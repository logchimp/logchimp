import validator from "validator";

export class DomainBlacklistManager {
  domains: Set<string> = new Set();

  constructor() {
    const blacklist = process.env.LOGCHIMP_BLACKLISTED_DOMAINS || "";
    this.parse(blacklist);
  }

  reset(): void {
    this.domains = new Set();
    const blacklist = process.env.LOGCHIMP_BLACKLISTED_DOMAINS || "";
    this.parse(blacklist);
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
