import { type Duration, ms } from "./duration";
import {
  fixedWindowLimitScript,
  fixedWindowPeekScript,
  slidingWindowLimitScript,
  slidingWindowPeekScript,
  tokenBucketLimitScript,
  tokenBucketPeekScript,
} from "./scripts";
import type {
  RateLimitAlgorithm,
  RateLimitCheck,
  RateLimitOptions,
  RateLimitResult,
  RateLimitStore,
} from "./types";

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer, got: ${value}`);
  }
}

/** Convert the raw script result into a consistent public result. */
function buildResult(
  remaining: number,
  limit: number,
  reset: number,
): RateLimitResult {
  return {
    success: remaining >= 0,
    limit,
    remaining: Math.max(0, remaining),
    reset,
  };
}

/**
 * Fixed window.
 *
 * A counter per window. Simple and cheap, but a burst near a window boundary
 * can let through up to 2x the limit (end of one window + start of the next).
 *
 * @param tokens - How many requests are allowed per window.
 * @param window - The window duration, e.g. `"1 m"`.
 *
 * @example
 * fixedWindow(100, "1 m");
 */
export function fixedWindow(
  tokens: number,
  window: Duration,
): RateLimitAlgorithm {
  assertPositiveInteger(tokens, "tokens");
  const windowMs = ms(window);

  return {
    name: "fixedWindow",
    limit: tokens,

    async consume(
      store: RateLimitStore,
      identifier: string,
      options?: RateLimitOptions & { now?: number },
    ): Promise<RateLimitResult> {
      const now = options?.now ?? Date.now();
      const incrementBy = options?.rate ?? 1;
      const bucket = Math.floor(now / windowMs);
      const key = `${identifier}:${bucket}`;

      const used = await store.evalScript<number>(
        fixedWindowLimitScript,
        [key],
        [incrementBy, windowMs],
      );

      const result = buildResult(
        tokens - used,
        tokens,
        (bucket + 1) * windowMs,
      );
      return result;
    },

    async peek(
      store: RateLimitStore,
      identifier: string,
      options?: { now?: number },
    ): Promise<RateLimitCheck> {
      const now = options?.now ?? Date.now();
      const bucket = Math.floor(now / windowMs);
      const key = `${identifier}:${bucket}`;

      const used = await store.evalScript<number>(
        fixedWindowPeekScript,
        [key],
        [],
      );

      return {
        remaining: Math.max(0, tokens - used),
        reset: (bucket + 1) * windowMs,
        limit: tokens,
      };
    },

    async reset(store: RateLimitStore, identifier: string): Promise<void> {
      await store.deleteByPrefix(`${identifier}:`);
    },
  };
}

/**
 * Sliding window.
 *
 * Combines the current and previous fixed windows with a weighted score, which
 * smooths out the boundary burst problem of `fixedWindow` without the storage
 * cost of a full sliding log.
 *
 * @param tokens - How many requests are allowed per window.
 * @param window - The window duration, e.g. `"1 m"`.
 *
 * @example
 * slidingWindow(100, "1 m");
 */
export function slidingWindow(
  tokens: number,
  window: Duration,
): RateLimitAlgorithm {
  assertPositiveInteger(tokens, "tokens");
  const windowMs = ms(window);

  return {
    name: "slidingWindow",
    limit: tokens,

    async consume(
      store: RateLimitStore,
      identifier: string,
      options?: RateLimitOptions & { now?: number },
    ): Promise<RateLimitResult> {
      const now = options?.now ?? Date.now();
      const incrementBy = options?.rate ?? 1;
      const currentWindow = Math.floor(now / windowMs);
      const currentKey = `${identifier}:${currentWindow}`;
      const previousKey = `${identifier}:${currentWindow - 1}`;

      const remaining = await store.evalScript<number>(
        slidingWindowLimitScript,
        [currentKey, previousKey],
        [tokens, now, windowMs, incrementBy],
      );

      return buildResult(remaining, tokens, (currentWindow + 1) * windowMs);
    },

    async peek(
      store: RateLimitStore,
      identifier: string,
      options?: { now?: number },
    ): Promise<RateLimitCheck> {
      const now = options?.now ?? Date.now();
      const currentWindow = Math.floor(now / windowMs);
      const currentKey = `${identifier}:${currentWindow}`;
      const previousKey = `${identifier}:${currentWindow - 1}`;

      const remaining = await store.evalScript<number>(
        slidingWindowPeekScript,
        [currentKey, previousKey],
        [tokens, now, windowMs],
      );

      return {
        remaining: Math.max(0, remaining),
        reset: (currentWindow + 1) * windowMs,
        limit: tokens,
      };
    },

    async reset(store: RateLimitStore, identifier: string): Promise<void> {
      await store.deleteByPrefix(`${identifier}:`);
    },
  };
}

/**
 * Token bucket.
 *
 * A bucket starts full (`maxTokens`) and refills by `refillRate` tokens every
 * `interval`. Each request takes one token. Bursts are allowed up to the
 * bucket size, while the long term rate is `refillRate / interval`.
 *
 * @param refillRate - Tokens added per interval.
 * @param interval - How often tokens are added, e.g. `"1 s"`.
 * @param maxTokens - Bucket size (maximum burst).
 *
 * @example
 * // 10 requests per second, burst up to 50
 * tokenBucket(10, "1 s", 50);
 */
export function tokenBucket(
  refillRate: number,
  interval: Duration,
  maxTokens: number,
): RateLimitAlgorithm {
  assertPositiveInteger(refillRate, "refillRate");
  assertPositiveInteger(maxTokens, "maxTokens");
  const intervalMs = ms(interval);

  return {
    name: "tokenBucket",
    limit: maxTokens,

    async consume(
      store: RateLimitStore,
      identifier: string,
      options?: RateLimitOptions & { now?: number },
    ): Promise<RateLimitResult> {
      const now = options?.now ?? Date.now();
      const incrementBy = options?.rate ?? 1;

      const [remaining, reset] = await store.evalScript<[number, number]>(
        tokenBucketLimitScript,
        [identifier],
        [maxTokens, intervalMs, refillRate, now, incrementBy],
      );

      return buildResult(remaining, maxTokens, reset);
    },

    async peek(
      store: RateLimitStore,
      identifier: string,
      options?: { now?: number },
    ): Promise<RateLimitCheck> {
      const now = options?.now ?? Date.now();

      const [tokens, refilledAt] = await store.evalScript<[number, number]>(
        tokenBucketPeekScript,
        [identifier],
        [maxTokens],
      );

      return {
        remaining: Math.max(0, tokens),
        // No bucket yet: it will be full as soon as it is created.
        reset: refilledAt === -1 ? now + intervalMs : refilledAt + intervalMs,
        limit: maxTokens,
      };
    },

    async reset(store: RateLimitStore, identifier: string): Promise<void> {
      await store.delete(identifier);
    },
  };
}
