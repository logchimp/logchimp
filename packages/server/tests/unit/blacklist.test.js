import { describe, it, expect, beforeAll, vi } from 'vitest';
import { isDomainBlacklisted, parseBlacklistedDomains } from '../../controllers/auth/domainBlacklist';

vi.mock("../../../../utils/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

const originalParseBlacklistedDomains = parseBlacklistedDomains;
const parsedBlacklistCache = new Map();

vi.mock('../../controllers/auth/domainBlacklist', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    parseBlacklistedDomains: (rawDomains) => {
      if (!parsedBlacklistCache.has(rawDomains)) {
        parsedBlacklistCache.set(rawDomains, originalParseBlacklistedDomains(rawDomains));
      }
      return parsedBlacklistCache.get(rawDomains);
    },
  };
});


describe('isDomainBlacklisted', () => {
  beforeAll(() => {
    parsedBlacklistCache.clear();
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'example.com, test.com, spam.com, badsite.org';
  });

  it('should return true for blacklisted domains', () => {
    expect(isDomainBlacklisted('user@example.com')).toBeTruthy();
    expect(isDomainBlacklisted('test@test.com')).toBeTruthy();
    expect(isDomainBlacklisted('admin@spam.com')).toBeTruthy();
  });

  it('should return false for non-blacklisted domains', () => {
    expect(isDomainBlacklisted('hello@good.com')).toBeFalsy();
    expect(isDomainBlacklisted('admin@other.org')).toBeFalsy();
  });

  it('should return false for invalid email formats', () => {
    expect(isDomainBlacklisted('not-an-email')).toBeFalsy();
    expect(isDomainBlacklisted('user@@spam.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@')).toBeFalsy();
    expect(isDomainBlacklisted('@domain.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@domain')).toBeFalsy();
  });

  it('should be case insensitive', () => {
    expect(isDomainBlacklisted('USER@Spam.com')).toBeTruthy();
    expect(isDomainBlacklisted('ADMIN@bAdSiTe.ORG')).toBeTruthy();
    expect(isDomainBlacklisted('uSeR@eXaMpLe.CoM')).toBeTruthy();
  });

  it('should return false for non-string input', () => {
    expect(isDomainBlacklisted(null)).toBeFalsy();
    expect(isDomainBlacklisted(undefined)).toBeFalsy();
    expect(isDomainBlacklisted(42)).toBeFalsy();
    expect(isDomainBlacklisted([])).toBeFalsy();
    expect(isDomainBlacklisted({})).toBeFalsy();
  });

  it('should handle blacklisted domains with subdomains', () => {
    expect(isDomainBlacklisted('user@sub.example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@another.test.com')).toBeFalsy();
  });

  it('should handle domains with leading/trailing spaces in the email', () => {
    expect(isDomainBlacklisted(' user@example.com ')).toBeTruthy();
    expect(isDomainBlacklisted('user@spam.com ')).toBeTruthy();
    expect(isDomainBlacklisted(' user@test.com')).toBeTruthy();
  });

  it('should return false if blacklisted domains environment variable is empty or invalid', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = '';
    parsedBlacklistCache.clear();
    expect(isDomainBlacklisted('user@example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@test.com')).toBeFalsy();

    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'invalid-domain-!!, another.com';
    parsedBlacklistCache.clear();
    expect(isDomainBlacklisted('user@invalid-domain-!!.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@another.com')).toBeTruthy();
  });

  it('should handle multiple blacklisted domains and non-blacklisted domains correctly', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'domain1.com, domain2.org, domain3.net';
    parsedBlacklistCache.clear();

    expect(isDomainBlacklisted('user@domain1.com')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain2.org')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain3.net')).toBeTruthy();
    expect(isDomainBlacklisted('user@domain4.xyz')).toBeFalsy();
    expect(isDomainBlacklisted('user@domain1.net')).toBeFalsy();
  });

  it('should return false for valid domains not in the blacklist', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'foo.com, bar.net';
    parsedBlacklistCache.clear();

    expect(isDomainBlacklisted('user@baz.org')).toBeFalsy();
    expect(isDomainBlacklisted('info@qux.io')).toBeFalsy();
  });

  it('should handle domains with different TLD lengths', () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = 'shorttld.co, longtld.museum';
    parsedBlacklistCache.clear();

    expect(isDomainBlacklisted('user@shorttld.co')).toBeTruthy();
    expect(isDomainBlacklisted('user@longtld.museum')).toBeTruthy();
    expect(isDomainBlacklisted('user@onetld.x')).toBeFalsy();
  });

  it('should treat an invalid domain as non-blacklisted even if it looks like a blacklisted one', () => {
    expect(isDomainBlacklisted('user@-example.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@.test.com')).toBeFalsy();
    expect(isDomainBlacklisted('user@spam.com.')).toBeFalsy();
  });
});