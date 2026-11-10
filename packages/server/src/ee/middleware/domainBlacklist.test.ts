import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { domainBlacklist } from "./domainBlacklist";
import { domainBlacklistManager } from "../services/auth/auth.service";

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/test", domainBlacklist, (_req, res) => {
    res.status(200).json({ success: true });
  });

  return app;
}

describe("domainBlacklist middleware", () => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: express type
  let app;

  beforeEach(() => {
    app = createApp();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    domainBlacklistManager.reset();
  });

  it("should block blacklisted domains", async () => {
    vi.stubEnv(
      "LOGCHIMP_BLACKLISTED_DOMAINS",
      "example.com, test.com, spam.com, badsite.org",
    );
    domainBlacklistManager.reset();

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
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "hello@good.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject invalid email formats", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "example.com, test.com");
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });

  it("should allow subdomains unless explicitly blacklisted", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "example.com");
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "user@sub.example.com" });

    expect(res.status).toBe(200);
  });

  it("should allow if blacklist is empty", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "");
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(200);
  });

  it("should reject invalid email domains", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "");
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "user@invalid" });

    expect(res.status).toBe(400);
  });

  it("should block multiple blacklisted domains", async () => {
    vi.stubEnv(
      "LOGCHIMP_BLACKLISTED_DOMAINS",
      "example.com, test.com, spam.com",
    );
    domainBlacklistManager.reset();

    let res = await request(app).post("/test").send({ email: "user@test.com" });
    expect(res.status).toBe(403);

    res = await request(app).post("/test").send({ email: "user@spam.com" });
    expect(res.status).toBe(403);
  });

  it("should handle case insensitivity for blacklisted domains", async () => {
    vi.stubEnv("LOGCHIMP_BLACKLISTED_DOMAINS", "EXAMPLE.COM");
    domainBlacklistManager.reset();

    const res = await request(app)
      .post("/test")
      .send({ email: "User@Example.Com" });

    expect(res.status).toBe(403);
  });
});
