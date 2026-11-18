import { describe, expect, it } from "vitest";

import { fixedWindow, slidingWindow, tokenBucket } from "./algorithms";
import { ms } from "./duration";
import { RateLimiter } from "./limiter";
import { MemoryRateLimitStore } from "./store";

const MINUTE = 60_000;

describe("ms", () => {
  it("parses human readable durations", () => {
    expect(ms("10 s")).toBe(10_000);
    expect(ms("1m")).toBe(60_000);
    expect(ms("2 h")).toBe(2 * 60 * 60 * 1000);
    expect(ms(500)).toBe(500);
  });

  it("rejects invalid durations", () => {
    // @ts-expect-error testing invalid input
    expect(() => ms("10 minutes")).toThrow();
    expect(() => ms(0)).toThrow();
  });
});

describe("fixedWindow", () => {
  it("allows exactly `tokens` requests per window", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = fixedWindow(2, "1 m");
    const now = 2 * MINUTE;

    const first = await limiter.consume(store, "user:1", { now });
    expect(first).toMatchObject({ success: true, remaining: 1, limit: 2 });
    expect(first.reset).toBe(3 * MINUTE);

    expect(await limiter.consume(store, "user:1", { now })).toMatchObject({
      success: true,
      remaining: 0,
    });

    expect(await limiter.consume(store, "user:1", { now })).toMatchObject({
      success: false,
      remaining: 0,
    });

    // A new window starts with a fresh counter.
    expect(
      await limiter.consume(store, "user:1", { now: 3 * MINUTE }),
    ).toMatchObject({ success: true, remaining: 1 });
  });

  it("consumes the given rate", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = fixedWindow(10, "1 m");
    const now = MINUTE;

    const result = await limiter.consume(store, "user:1", { now, rate: 10 });
    expect(result).toMatchObject({ success: true, remaining: 0 });

    expect(await limiter.consume(store, "user:1", { now })).toMatchObject({
      success: false,
    });
  });

  it("reports remaining tokens and resets state", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = fixedWindow(5, "1 m");
    const now = MINUTE;

    await limiter.consume(store, "user:1", { now, rate: 2 });

    expect(await limiter.peek(store, "user:1", { now })).toMatchObject({
      remaining: 3,
      limit: 5,
      reset: 2 * MINUTE,
    });

    await limiter.reset(store, "user:1");
    expect(await limiter.peek(store, "user:1", { now })).toMatchObject({
      remaining: 5,
    });
  });
});

describe("slidingWindow", () => {
  it("weights requests from the previous window", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = slidingWindow(3, "1 m");

    // Fill the window that starts at t=60s.
    for (let i = 0; i < 3; i += 1) {
      const result = await limiter.consume(store, "user:1", {
        now: 90_000,
      });
      expect(result.success).toBe(true);
    }

    // At t=120s the previous window still has full weight.
    expect(
      await limiter.consume(store, "user:1", { now: 120_000 }),
    ).toMatchObject({ success: false });

    // At t=150s (halfway through) only half of the previous window counts,
    // so two requests may pass.
    expect(
      await limiter.consume(store, "user:1", { now: 150_000 }),
    ).toMatchObject({ success: true });
    expect(
      await limiter.consume(store, "user:1", { now: 150_000 }),
    ).toMatchObject({ success: true });
    expect(
      await limiter.consume(store, "user:1", { now: 150_000 }),
    ).toMatchObject({ success: false });
  });
});

describe("tokenBucket", () => {
  it("refills gradually and allows bursts up to maxTokens", async () => {
    const store = new MemoryRateLimitStore();
    // 2 tokens per minute, burst up to 2.
    const limiter = tokenBucket(2, "1 m", 2);
    const now = 2 * MINUTE;

    expect(await limiter.consume(store, "user:1", { now })).toMatchObject({
      success: true,
      remaining: 1,
    });
    expect(await limiter.consume(store, "user:1", { now })).toMatchObject({
      success: true,
      remaining: 0,
    });

    const rejected = await limiter.consume(store, "user:1", { now });
    expect(rejected.success).toBe(false);
    expect(rejected.reset).toBe(3 * MINUTE);

    // One minute later the bucket is full again.
    expect(
      await limiter.consume(store, "user:1", { now: 3 * MINUTE }),
    ).toMatchObject({ success: true, remaining: 1 });
  });

  it("refunds tokens with a negative rate", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = tokenBucket(1, "1 m", 5);

    await limiter.consume(store, "user:1", { now: MINUTE });
    const result = await limiter.consume(store, "user:1", {
      now: MINUTE,
      rate: -1,
    });

    expect(result).toMatchObject({ success: true, remaining: 5 });
  });
});

describe("RateLimiter", () => {
  it("blocks without hitting the store after a rejection", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = new RateLimiter({
      limiter: fixedWindow(1, "1 h"),
      store,
      prefix: "test:cache",
    });

    expect(await limiter.limit("user:1")).toMatchObject({ success: true });

    const rejected = await limiter.limit("user:1");
    expect(rejected.success).toBe(false);

    const cached = await limiter.limit("user:1");
    expect(cached).toMatchObject({ success: false, reason: "cacheBlock" });

    await limiter.resetUsedTokens("user:1");
    expect(await limiter.limit("user:1")).toMatchObject({ success: true });
  });

  it("isolates identifiers", async () => {
    const store = new MemoryRateLimitStore();
    const limiter = new RateLimiter({
      limiter: fixedWindow(1, "1 h"),
      store,
    });

    expect(await limiter.limit("user:1")).toMatchObject({ success: true });
    expect(await limiter.limit("user:1")).toMatchObject({ success: false });
    expect(await limiter.limit("user:2")).toMatchObject({ success: true });
  });
});
