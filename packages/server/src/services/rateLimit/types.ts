/**
 * Result of a rate limit check.
 *
 * The shape is intentionally the same as `@upstash/ratelimit`, so existing
 * documentation/examples for that library can be reused almost verbatim.
 */
export type RateLimitResult = {
  /** Whether the request may pass (`true`) or has exceeded the limit (`false`). */
  success: boolean;
  /** Maximum number of requests/tokens allowed in the current window. */
  limit: number;
  /** Requests/tokens left in the current window. */
  remaining: number;
  /** Unix timestamp in milliseconds when the limit resets. */
  reset: number;
  /**
   * Set when the result did not come from the store:
   * - `cacheBlock`: identifier was already known to be blocked (no round trip)
   * - `timeout`: the store did not answer in time, request was allowed
   * - `error`: the store failed, request was allowed
   */
  reason?: "cacheBlock" | "timeout" | "error";
};

/** Options for a single `limit()` call. */
export type RateLimitOptions = {
  /**
   * How many tokens this request consumes. Defaults to `1`.
   * Must be an integer. Negative values refund tokens.
   */
  rate?: number;
};

/** Snapshot of the current state of an identifier, without consuming. */
export type RateLimitCheck = {
  remaining: number;
  reset: number;
  limit: number;
};

export type RateLimitAlgorithm = {
  /** Human readable name, useful for logs/metrics. */
  readonly name: string;
  /** Maximum requests/tokens allowed per window. */
  readonly limit: number;
  /** Atomically consume `rate` tokens (default `1`). */
  consume: (
    store: RateLimitStore,
    identifier: string,
    options?: RateLimitOptions & { now?: number },
  ) => Promise<RateLimitResult>;
  /** Read the current state without consuming anything. */
  peek: (
    store: RateLimitStore,
    identifier: string,
    options?: { now?: number },
  ) => Promise<RateLimitCheck>;
  /** Remove all stored state for an identifier. */
  reset: (store: RateLimitStore, identifier: string) => Promise<void>;
};

/**
 * A script that has two interchangeable implementations:
 * - `lua` is executed atomically by Valkey/Redis
 * - `run` is the same logic in JavaScript, used by the in-memory store
 *
 * Keeping both next to each other makes it easy to verify they behave the same.
 */
export type RateLimitScript = {
  name: string;
  lua: string;
  run: (state: MemoryState, keys: string[], args: string[]) => unknown;
};

/** The small subset of Redis commands the algorithms need. */
export interface MemoryState {
  get: (key: string) => number | null;
  incrBy: (key: string, increment: number) => number;
  pexpire: (key: string, ttlMs: number) => void;
  hgetall: (key: string) => Record<string, number>;
  hset: (key: string, fields: Record<string, number>) => void;
}

/**
 * Storage used by the rate limit algorithms.
 *
 * Two implementations ship with this module:
 * - `ValkeyRateLimitStore` - shared state, required for multiple API instances
 * - `MemoryRateLimitStore` - per-process state, used when no cache is configured
 */
export interface RateLimitStore {
  readonly kind: "valkey" | "memory";
  /** Run a rate limit script atomically. */
  evalScript: <T>(
    script: RateLimitScript,
    keys: string[],
    args: Array<string | number>,
  ) => Promise<T>;
  /** Delete exact keys. */
  delete: (...keys: string[]) => Promise<void>;
  /** Delete every key starting with `prefix`. */
  deleteByPrefix: (prefix: string) => Promise<void>;
}
