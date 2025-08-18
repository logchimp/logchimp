import { describe, it, expect } from "vitest";

import {
  isDomainBlacklisted,
  parseBlacklistedDomains,
  isValidDomain,
} from "./../../src/utils/domainBlacklist";

describe("isDomainBlacklisted", () => {
  it("should return true for blacklisted domains", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com, badsite.org";

    expect(isDomainBlacklisted("user@example.com")).toBeTruthy();
    expect(isDomainBlacklisted("test@test.com")).toBeTruthy();
    expect(isDomainBlacklisted("admin@spam.com")).toBeTruthy();
  });

  it("should return false for non-blacklisted domains", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com, badsite.org";

    expect(isDomainBlacklisted("hello@good.com")).toBeFalsy();
    expect(isDomainBlacklisted("admin@other.org")).toBeFalsy();
  });

  it("should return false for invalid email formats", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com";

    expect(isDomainBlacklisted("not-an-email")).toBeFalsy();
    expect(isDomainBlacklisted("user@@spam.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@")).toBeFalsy();
    expect(isDomainBlacklisted("@domain.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@domain")).toBeFalsy();
  });

  it("should be case insensitive", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com, badsite.org";

    expect(isDomainBlacklisted("USER@Spam.com")).toBeTruthy();
    expect(isDomainBlacklisted("ADMIN@bAdSiTe.ORG")).toBeTruthy();
    expect(isDomainBlacklisted("uSeR@eXaMpLe.CoM")).toBeTruthy();
  });

  it("should return false for non-string input", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = "example.com";

    //@ts-ignore
    expect(isDomainBlacklisted(null)).toBeFalsy();
    //@ts-ignore
    expect(isDomainBlacklisted(undefined)).toBeFalsy();
    //@ts-ignore
    expect(isDomainBlacklisted(42)).toBeFalsy();
    //@ts-ignore
    expect(isDomainBlacklisted([])).toBeFalsy();
    //@ts-ignore
    expect(isDomainBlacklisted({})).toBeFalsy();
  });

  it("should handle blacklisted domains with subdomains (should be false unless specifically blacklisted)", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com";

    expect(isDomainBlacklisted("user@sub.example.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@another.test.com")).toBeFalsy();
  });

  it("should handle domains with leading/trailing spaces in the email", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com";

    expect(isDomainBlacklisted(" user@example.com ")).toBeTruthy();
    expect(isDomainBlacklisted("user@spam.com ")).toBeTruthy();
    expect(isDomainBlacklisted(" user@test.com")).toBeTruthy();
  });

  it("should return false if blacklisted domains environment variable is empty or invalid", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = "";
    expect(isDomainBlacklisted("user@example.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@test.com")).toBeFalsy();

    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = "invalid-domain-!!, another.com";
    expect(isDomainBlacklisted("user@invalid-domain-!!.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@another.com")).toBeTruthy();
  });

  it("should handle multiple blacklisted domains and non-blacklisted domains correctly", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "domain1.com, domain2.org, domain3.net";

    expect(isDomainBlacklisted("user@domain1.com")).toBeTruthy();
    expect(isDomainBlacklisted("user@domain2.org")).toBeTruthy();
    expect(isDomainBlacklisted("user@domain3.net")).toBeTruthy();
    expect(isDomainBlacklisted("user@domain4.xyz")).toBeFalsy();
    expect(isDomainBlacklisted("user@domain1.net")).toBeFalsy();
  });

  it("should return false for valid domains not in the blacklist", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = "foo.com, bar.net";

    expect(isDomainBlacklisted("user@baz.org")).toBeFalsy();
    expect(isDomainBlacklisted("info@qux.io")).toBeFalsy();
  });

  it("should handle domains with different TLD lengths", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS = "shorttld.co, longtld.museum";

    expect(isDomainBlacklisted("user@shorttld.co")).toBeTruthy();
    expect(isDomainBlacklisted("user@longtld.museum")).toBeTruthy();
    expect(isDomainBlacklisted("user@onetld.x")).toBeFalsy();
  });

  it("should treat an invalid domain in email as non-blacklisted even if it looks like a blacklisted one", () => {
    process.env.LOGCHIMP_BLACKLISTED_DOMAINS =
      "example.com, test.com, spam.com";

    expect(isDomainBlacklisted("user@-example.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@.test.com")).toBeFalsy();
    expect(isDomainBlacklisted("user@spam.com.")).toBeFalsy();
  });
});

describe("isValidDomain", () => {
  it("should return true for valid simple domains", () => {
    expect(isValidDomain("example.com")).toBeTruthy();
    expect(isValidDomain("test.org")).toBeTruthy();
    expect(isValidDomain("sub.domain.net")).toBeTruthy();
    expect(isValidDomain("another-site.info")).toBeTruthy();
    expect(isValidDomain("long-domain-name-with-hyphens.co.uk")).toBeTruthy();
  });

  it("should handle case insensitivity", () => {
    expect(isValidDomain("EXAMPLE.COM")).toBeTruthy();
    expect(isValidDomain("TeSt.oRg")).toBeTruthy();
  });

  it("should return true for domains with numbers", () => {
    expect(isValidDomain("123example.com")).toBeTruthy();
    expect(isValidDomain("domain-123.net")).toBeTruthy();
  });

  it("should return false for null, undefined, or non-string input", () => {
    //@ts-ignore
    expect(isValidDomain(null)).toBeFalsy();
    //@ts-ignore
    expect(isValidDomain(undefined)).toBeFalsy();
    //@ts-ignore
    expect(isValidDomain(123)).toBeFalsy();
    //@ts-ignore
    expect(isValidDomain({})).toBeFalsy();
    //@ts-ignore
    expect(isValidDomain([])).toBeFalsy();
  });

  it("should return false for empty string or only spaces", () => {
    expect(isValidDomain("")).toBeFalsy();
    expect(isValidDomain("   ")).toBeFalsy();
  });

  it("should return false for domains with invalid characters", () => {
    expect(isValidDomain("bad@domain.com")).toBeFalsy();
    expect(isValidDomain("domain!.com")).toBeFalsy();
    expect(isValidDomain("dom_ain.com")).toBeFalsy();
    expect(isValidDomain("with space.com")).toBeFalsy();
  });

  it("should return false for domains starting/ending with hyphens", () => {
    expect(isValidDomain("-example.com")).toBeFalsy();
    expect(isValidDomain("example-.com")).toBeFalsy();
  });

  it("should return false for domains starting/ending with dots", () => {
    expect(isValidDomain(".example.com")).toBeFalsy();
    expect(isValidDomain("example.com.")).toBeFalsy();
  });

  it("should return false for domains with empty labels", () => {
    expect(isValidDomain("example..com")).toBeFalsy();
    expect(isValidDomain("example.com.")).toBeFalsy();
    expect(isValidDomain(".example.com")).toBeFalsy();
  });

  it("should return false for invalid TLDs (too short or missing)", () => {
    expect(isValidDomain("example.c")).toBeFalsy();
    expect(isValidDomain("example")).toBeFalsy();
    expect(isValidDomain("example.")).toBeFalsy();
  });

  it("should return false for labels starting/ending with hyphens", () => {
    expect(isValidDomain("sub-.example.com")).toBeFalsy();
    expect(isValidDomain("-sub.example.com")).toBeFalsy();
    expect(isValidDomain("example.-com")).toBeFalsy();
  });

  it("should return false for labels exceeding 63 characters", () => {
    const longLabel = "a".repeat(64);
    expect(isValidDomain(`${longLabel}.com`)).toBeFalsy();
  });

  it("should return false for an IP address", () => {
    expect(isValidDomain("192.168.1.1")).toBeFalsy();
  });

  it("should return false for localhost", () => {
    expect(isValidDomain("localhost")).toBeFalsy();
  });
});

describe("parseBlacklistedDomains", () => {
  it("should return a set of valid domains", () => {
    const input = "example.com, test.org, valid.net";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["example.com", "test.org", "valid.net"]));
  });

  it("should trim spaces and convert to lowercase", () => {
    const input = "   Foo.COM , BAR.org ";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["foo.com", "bar.org"]));
  });

  it("should skip empty domains and not warn for them", () => {
    const input = "one.com, , ,two.org";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["one.com", "two.org"]));
  });

  it("should return an empty set for empty, null, or undefined input", () => {
    expect(parseBlacklistedDomains("")).toEqual(new Set());
    //@ts-ignore
    expect(parseBlacklistedDomains(null)).toEqual(new Set());
    //@ts-ignore
    expect(parseBlacklistedDomains(undefined)).toEqual(new Set());
  });

  it("should ignore invalid domains", () => {
    const input = "good.com, bad@domain, .invalid, another.good";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["good.com", "another.good"]));
  });

  it("should reject domains with leading/trailing hyphens or dots", () => {
    const input = "-bad.com, good.com., .start.com, end-.com, nice.org";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["nice.org"]));
  });

  it("should not crash on non-string input", () => {
    //@ts-ignore
    expect(parseBlacklistedDomains(123)).toEqual(new Set());
    //@ts-ignore
    expect(parseBlacklistedDomains({})).toEqual(new Set());
    //@ts-ignore
    expect(parseBlacklistedDomains([])).toEqual(new Set());
  });

  it("should handle duplicate valid domains by returning a set with unique entries", () => {
    const input = "domain.com, example.org, domain.com, test.net, Example.org";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["domain.com", "example.org", "test.net"]));
  });

  it("should correctly parse a mix of valid, invalid, and empty entries", () => {
    const input =
      "valid1.com , invalid@bad , valid2.org, , -invalid.net , final.co.uk ";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(
      new Set(["valid1.com", "valid2.org", "final.co.uk"])
    );
  });

  it("should return an empty set if all domains are invalid", () => {
    const input = "bad@domain, .invalid, -start.com, end-.org";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set());
  });

  it("should correctly handle domains with numbers and hyphens that are valid", () => {
    const input =
      "my-site-123.com, 24x7support.net, domain-with-many-hyphens-and-numbers-123.info";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(
      new Set([
        "my-site-123.com",
        "24x7support.net",
        "domain-with-many-hyphens-and-numbers-123.info",
      ])
    );
  });

  it("should exclude labels exceeding 63 characters", () => {
    const longLabel64 = "a".repeat(64);
    const input = `valid.com, ${longLabel64}.invalid.com, another.net`;
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["valid.com", "another.net"]));
  });

  it("should handle single domain input", () => {
    const input = "single.domain.com";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["single.domain.com"]));
  });

  it("should handle trailing commas", () => {
    const input = "domain.com, ";
    const result = parseBlacklistedDomains(input);
    expect(result).toEqual(new Set(["domain.com"]));
  });
});
