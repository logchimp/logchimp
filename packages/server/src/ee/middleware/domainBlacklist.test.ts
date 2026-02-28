import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import {
  domainBlacklist,
  parseBlacklistedDomains,
  isValidDomain,
  blacklistManager,
} from "./domainBlacklist";

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/test", domainBlacklist, (req, res) => {
    res.status(200).json({ success: true });
  });

  return app;
}

describe("domainBlacklist", () => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: express type
  let app;

  beforeEach(() => {
    app = createApp();
    blacklistManager.reset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should block blacklisted domains", async () => {
    vi.stubEnv(
      "LOGCHIMP_BLACKLISTED_DOMAINS",
      "example.com, test.com, spam.com, badsite.org",
    );

    const res = await request(app)
      .post("/test")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(403);
  });

  it("should allow non-blacklisted domains", async () => {
    vi.stubEnv(
      "LOGCHIMP_BLACKLISTED_DOMAINS",
      "example.com, test.com, spam.com, badsite.org",
    );

    const res = await request(app)
      .post("/test")
      .send({ email: "hello@good.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject invalid email formats", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "example.com, test.com");

    const res = await request(app)
      .post("/test")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("should allow subdomains unless explicitly blacklisted", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "example.com");

    const res = await request(app)
      .post("/test")
      .send({ email: "user@sub.example.com" });

    expect(res.status).toBe(200);
  });

  it("should allow if blacklist is empty", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "");

    const res = await request(app)
      .post("/test")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(200);
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
      new Set(["valid1.com", "valid2.org", "final.co.uk"]),
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
      ]),
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
