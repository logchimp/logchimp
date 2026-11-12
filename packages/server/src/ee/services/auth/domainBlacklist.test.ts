import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DomainBlacklistManager } from "./auth.service";

describe("DomainBlacklistManager", () => {
  let manager: DomainBlacklistManager;

  beforeEach(() => {
    manager = new DomainBlacklistManager();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should parse a comma-separated list of domains", () => {
    manager.parse("example.com, test.org, valid.net");
    expect(manager.domains).toEqual(
      new Set(["example.com", "test.org", "valid.net"]),
    );
  });

  it("should trim spaces and convert to lowercase", () => {
    manager.parse("   Foo.COM , BAR.org ");
    expect(manager.domains).toEqual(new Set(["foo.com", "bar.org"]));
  });

  it("should skip empty domains", () => {
    manager.parse("one.com, , ,two.org");
    expect(manager.domains).toEqual(new Set(["one.com", "two.org"]));
  });

  it("should return an empty set for empty input", () => {
    manager.parse("");
    expect(manager.domains).toEqual(new Set());
  });

  it("should ignore invalid domains", () => {
    manager.parse("good.com, bad@domain, .invalid, another.good");
    expect(manager.domains).toEqual(new Set(["good.com", "another.good"]));
  });

  it("should reject domains with leading/trailing hyphens or dots", () => {
    manager.parse("-bad.com, good.com., .start.com, end-.com, nice.org");
    expect(manager.domains).toEqual(new Set(["nice.org"]));
  });

  it("should not crash on non-string input", () => {
    // @ts-expect-error
    manager.parse(123);
    expect(manager.domains).toEqual(new Set());
    // @ts-expect-error
    manager.parse({});
    expect(manager.domains).toEqual(new Set());
    // @ts-expect-error
    manager.parse([]);
    expect(manager.domains).toEqual(new Set());
  });

  it("should handle duplicate valid domains by returning a set with unique entries", () => {
    manager.parse("domain.com, example.org, domain.com, test.net, Example.org");
    expect(manager.domains).toEqual(
      new Set(["domain.com", "example.org", "test.net"]),
    );
  });

  it("should correctly parse a mix of valid, invalid, and empty entries", () => {
    manager.parse(
      "valid1.com , invalid@bad , valid2.org, , -invalid.net , final.co.uk ",
    );
    expect(manager.domains).toEqual(
      new Set(["valid1.com", "valid2.org", "final.co.uk"]),
    );
  });

  it("should return an empty set if all domains are invalid", () => {
    manager.parse("bad@domain, .invalid, -start.com, end-.org");
    expect(manager.domains).toEqual(new Set());
  });

  it("should correctly handle domains with numbers and hyphens that are valid", () => {
    manager.parse(
      "my-site-123.com, 24x7support.net, domain-with-many-hyphens-and-numbers-123.info",
    );
    expect(manager.domains).toEqual(
      new Set([
        "my-site-123.com",
        "24x7support.net",
        "domain-with-many-hyphens-and-numbers-123.info",
      ]),
    );
  });

  it("should exclude labels exceeding 63 characters", () => {
    const longLabel64 = "a".repeat(64);
    manager.parse(`valid.com, ${longLabel64}.invalid.com, another.net`);
    expect(manager.domains).toEqual(new Set(["valid.com", "another.net"]));
  });

  it("should handle single domain input", () => {
    manager.parse("single.domain.com");
    expect(manager.domains).toEqual(new Set(["single.domain.com"]));
  });

  it("should handle trailing commas", () => {
    manager.parse("domain.com, ");
    expect(manager.domains).toEqual(new Set(["domain.com"]));
  });

  it("should initialize from LOGCHIMP_BLACKLISTED_DOMAINS env var", () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "env.com, test.org");
    const envManager = new DomainBlacklistManager();
    expect(envManager.domains).toEqual(new Set(["env.com", "test.org"]));
  });

  it("should reset and re-parse from env var", () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "initial.com");
    const resetManager = new DomainBlacklistManager();
    expect(resetManager.domains).toEqual(new Set(["initial.com"]));

    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "updated.com, new.org");
    resetManager.reset();
    expect(resetManager.domains).toEqual(new Set(["updated.com", "new.org"]));
  });

  it("should handle null and undefined input gracefully", () => {
    manager.parse(null);
    expect(manager.domains).toEqual(new Set());
    manager.parse(undefined);
    expect(manager.domains).toEqual(new Set());
  });
});
