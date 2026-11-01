import crypto from "node:crypto";
import { describe, expect, test } from "vitest";

import {
  SLACK_MAX_REQUEST_AGE_SECONDS,
  verifySlackSignature,
} from "./signature";

const signingSecret = "8f742231b10e8888abcd99yyyzzz85a5";
const rawBody = "payload=%7B%22type%22%3A%22message_action%22%7D";
const now = 1_700_000_000_000;
const timestamp = String(Math.floor(now / 1000));

const sign = (body: string, ts: string, secret = signingSecret) =>
  `v0=${crypto.createHmac("sha256", secret).update(`v0:${ts}:${body}`).digest("hex")}`;

describe("verifySlackSignature", () => {
  test("accepts a correctly signed request", () => {
    expect(
      verifySlackSignature({
        signingSecret,
        timestamp,
        signature: sign(rawBody, timestamp),
        rawBody,
        now,
      }),
    ).toBe(true);
  });

  test("accepts a Buffer body", () => {
    expect(
      verifySlackSignature({
        signingSecret,
        timestamp,
        signature: sign(rawBody, timestamp),
        rawBody: Buffer.from(rawBody),
        now,
      }),
    ).toBe(true);
  });

  test("rejects a tampered body", () => {
    expect(
      verifySlackSignature({
        signingSecret,
        timestamp,
        signature: sign(rawBody, timestamp),
        rawBody: `${rawBody}&extra=1`,
        now,
      }),
    ).toBe(false);
  });

  test("rejects a signature made with another secret", () => {
    expect(
      verifySlackSignature({
        signingSecret,
        timestamp,
        signature: sign(rawBody, timestamp, "another-secret"),
        rawBody,
        now,
      }),
    ).toBe(false);
  });

  test("rejects old requests (replay protection)", () => {
    const oldTimestamp = String(
      Math.floor(now / 1000) - SLACK_MAX_REQUEST_AGE_SECONDS - 1,
    );
    expect(
      verifySlackSignature({
        signingSecret,
        timestamp: oldTimestamp,
        signature: sign(rawBody, oldTimestamp),
        rawBody,
        now,
      }),
    ).toBe(false);
  });

  test("rejects missing or malformed headers", () => {
    const base = { signingSecret, rawBody, now };
    expect(
      verifySlackSignature({
        ...base,
        timestamp: undefined,
        signature: "v0=abc",
      }),
    ).toBe(false);
    expect(
      verifySlackSignature({ ...base, timestamp, signature: undefined }),
    ).toBe(false);
    expect(
      verifySlackSignature({
        ...base,
        timestamp: "not-a-number",
        signature: "v0=abc",
      }),
    ).toBe(false);
    expect(
      verifySlackSignature({ ...base, timestamp, signature: "short" }),
    ).toBe(false);
  });

  test("rejects when no signing secret is configured", () => {
    expect(
      verifySlackSignature({
        signingSecret: "",
        timestamp,
        signature: sign(rawBody, timestamp, ""),
        rawBody,
        now,
      }),
    ).toBe(false);
  });
});
