import logger from "../../utils/logger";
import { getDefaultStore } from "./store";
import type {
  RateLimitAlgorithm,
  RateLimitCheck,
  RateLimitOptions,
  RateLimitResult,
  RateLimitStore,
} from "./types";

const TIMEOUT = Symbol("rate-limit-timeout");
type Timeout = typeof TIMEOUT;

export const DEFAULT_PREFIX = "@logchimp/ratelimit";

export type RateLimiterConfig = {
  /** Algorithm created by `fixedWindow`, `slidingWindow` or `tokenBucket`. */
  limiter: RateLimitAlgorithm;
  /**
   * Namespace for all keys created by this limiter. Use a different prefix for
   * every distinct rate limit policy.
   *
   * @default "@logchimp/ratelimit"
   */
  prefix?: string;
  /** Storage. Defaults to Valkey when configured, otherwise in-memory. */
  store?: RateLimitStore;
  /**
   * Max time in milliseconds to wait for the store. When exceeded the request
   * is allowed (fail open). Set to `0` to disable the timeout.
   *
   * @default 2000
   */
  timeout?: number;
  /**
   * Remembers identifiers that exhausted their limit until they reset, so
   * blocked requests do not need a round trip to the store.
   *
   * Pass `false` to disable, or a `Map` to share the cache between limiters.
   */
  cache?: Map<string, number> | false;
  /**
   * Allow requests when the store is unreachable. Rate limiting availability
   * should not take down the API.
   *
   * @default true
   */
  failOpen?: boolean;
};

/**
 * A configured rate limiter.
 *
 * Use it as Express middleware:
 * ```ts
 * app.use("/api", rateLimit(limiter));
 * ```
 *
 * or call it from a controller:
 * ```ts
 * const { success, reset } = await limiter.limit(userId);
 * ```
 */
export class RateLimiter {
  private readonly limiter: RateLimitAlgorithm;
  private readonly prefix: string;
  private readonly store: RateLimitStore;
  private readonly timeout: number;
  private readonly cache?: Map<string, number>;
  private readonly failOpen: boolean;
  private cacheWrites = 0;

  constructor(config: RateLimiterConfig) {
    if (!config.limiter) {
      throw new Error("RateLimiter requires a limiter");
    }

    this.limiter = config.limiter;
    this.prefix = config.prefix ?? DEFAULT_PREFIX;
    this.store = config.store ?? getDefaultStore();
    this.timeout = config.timeout ?? 2000;
    this.cache =
      config.cache === false ? undefined : (config.cache ?? new Map());
    this.failOpen = config.failOpen ?? true;
  }

  /**
   * Consume tokens for `identifier` and report whether the request may pass.
   *
   * @param identifier - user id, API key, IP address, or a constant string.
   * @param options.rate - tokens to consume (default `1`).
   */
  async limit(
    identifier: string,
    options: RateLimitOptions = {},
  ): Promise<RateLimitResult> {
    const key = this.getKey(identifier);
    const incrementBy = options.rate ?? 1;

    if (!Number.isInteger(incrementBy)) {
      throw new Error(`rate must be an integer, got: ${incrementBy}`);
    }

    // Fast path: identifier is already known to be blocked.
    if (this.cache && incrementBy > 0) {
      const reset = this.cache.get(key);
      if (reset !== undefined) {
        if (reset > Date.now()) {
          return {
            success: false,
            limit: this.limiter.limit,
            remaining: 0,
            reset,
            reason: "cacheBlock",
          };
        }
        this.cache.delete(key);
      }
    }

    let result: RateLimitResult;

    try {
      const response = await this.withTimeout(() =>
        this.limiter.consume(this.store, key, {
          ...options,
          rate: incrementBy,
        }),
      );

      if (response === TIMEOUT) {
        return this.allowed("timeout");
      }

      result = response;
    } catch (error) {
      if (!this.failOpen) throw error;

      logger.error({
        message: "rate limit store failed, allowing request",
        error,
      });
      return this.allowed("error");
    }

    if (this.cache) {
      if (!result.success) {
        this.cache.set(key, result.reset);
        this.pruneCache();
      } else if (incrementBy < 0) {
        // A successful refund means the identifier is no longer blocked.
        this.cache.delete(key);
      }
    }

    return result;
  }

  /** Read the current state without consuming tokens. */
  async getRemaining(identifier: string): Promise<RateLimitCheck> {
    return this.limiter.peek(this.store, this.getKey(identifier));
  }

  /** Forget all state for an identifier (e.g. after a successful login). */
  async resetUsedTokens(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    this.cache?.delete(key);
    await this.limiter.reset(this.store, key);
  }

  private getKey(identifier: string): string {
    return `${this.prefix}:${identifier}`;
  }

  /** Drop expired entries so blocked identifiers cannot grow forever. */
  private pruneCache(): void {
    if (!this.cache) return;

    this.cacheWrites += 1;
    if (this.cacheWrites % 512 !== 0) return;

    const now = Date.now();
    for (const [key, reset] of this.cache) {
      if (reset <= now) {
        this.cache.delete(key);
      }
    }
  }

  private allowed(reason: "timeout" | "error"): RateLimitResult {
    return {
      success: true,
      limit: this.limiter.limit,
      remaining: this.limiter.limit,
      reset: 0,
      reason,
    };
  }

  private async withTimeout<T>(fn: () => Promise<T>): Promise<T | Timeout> {
    if (this.timeout <= 0) {
      return fn();
    }

    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<Timeout>((resolve) => {
      timer = setTimeout(() => resolve(TIMEOUT), this.timeout);
      timer.unref();
    });

    try {
      return await Promise.race([fn(), timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
