import { createHash } from "crypto";
import type Valkey from "iovalkey";

import { isActive, valkey } from "../../cache";
import logger from "../../utils/logger";
import type { MemoryState, RateLimitScript, RateLimitStore } from "./types";

/** The subset of the Valkey client used by the store. */
interface ValkeyClient {
  eval(
    script: string,
    numkeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>;
  evalsha(
    sha: string,
    numkeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>;
  scan(
    cursor: string,
    matchToken: "MATCH",
    pattern: string,
    countToken: "COUNT",
    count: number,
  ): Promise<[string, string[]]>;
  unlink(...keys: string[]): Promise<number>;
}

const NO_SCRIPT = /NOSCRIPT/i;

/** Escape Redis glob characters so a prefix can be used with `MATCH`. */
function escapeGlob(value: string): string {
  return value.replace(/[*?[\]\\]/g, "\\$&");
}

/**
 * Shared rate limit storage backed by Valkey/Redis.
 *
 * Scripts are sent with `EVALSHA` after the first call to avoid transferring
 * the Lua source on every request. `eval` is used as a fallback when Valkey
 * does not know the script yet.
 */
export class ValkeyRateLimitStore implements RateLimitStore {
  readonly kind = "valkey" as const;

  private readonly client: ValkeyClient;
  private readonly scriptShas = new WeakMap<RateLimitScript, string>();

  constructor(client: Valkey) {
    this.client = client as unknown as ValkeyClient;
  }

  async evalScript<T>(
    script: RateLimitScript,
    keys: string[],
    args: Array<string | number>,
  ): Promise<T> {
    const argv = args.map(String);
    let sha = this.scriptShas.get(script);

    if (!sha) {
      sha = createHash("sha1").update(script.lua).digest("hex");
      this.scriptShas.set(script, sha);
    }

    try {
      return (await this.client.evalsha(
        sha,
        keys.length,
        ...keys,
        ...argv,
      )) as T;
    } catch (error) {
      if (!NO_SCRIPT.test(String(error))) {
        throw error;
      }

      return (await this.client.eval(
        script.lua,
        keys.length,
        ...keys,
        ...argv,
      )) as T;
    }
  }

  async delete(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.unlink(...keys);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const pattern = `${escapeGlob(prefix)}*`;
    let cursor = "0";

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      // `MATCH` is only a hint; filter to be sure we never delete a key that
      // merely shares a prefix with the identifier (e.g. "user:1" vs "user:12").
      const matching = keys.filter((key) => key.startsWith(prefix));
      if (matching.length > 0) {
        await this.client.unlink(...matching);
      }
    } while (cursor !== "0");
  }
}

type StringEntry = { value: number; expiresAt: number | null };
type HashEntry = {
  fields: Map<string, number>;
  expiresAt: number | null;
};

/**
 * Per-process rate limit storage.
 *
 * Used automatically when no Valkey cache is configured (local development,
 * self-hosted single instance). It mirrors the Lua scripts exactly, so the
 * same algorithms behave the same way in both stores.
 *
 * Note: state is not shared between processes/instances.
 */
export class MemoryRateLimitStore implements RateLimitStore, MemoryState {
  readonly kind = "memory" as const;

  private readonly strings = new Map<string, StringEntry>();
  private readonly hashes = new Map<string, HashEntry>();
  private writes = 0;

  get(key: string): number | null {
    return this.getString(key)?.value ?? null;
  }

  incrBy(key: string, increment: number): number {
    const entry = this.getString(key);
    if (!entry) {
      this.strings.set(key, { value: increment, expiresAt: null });
      this.maybePrune();
      return increment;
    }

    entry.value += increment;
    this.maybePrune();
    return entry.value;
  }

  pexpire(key: string, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;

    const stringEntry = this.getString(key);
    if (stringEntry) {
      stringEntry.expiresAt = expiresAt;
      return;
    }

    const hashEntry = this.getHash(key);
    if (hashEntry) {
      hashEntry.expiresAt = expiresAt;
    }
  }

  hgetall(key: string): Record<string, number> {
    const entry = this.getHash(key);
    if (!entry) return {};

    const result: Record<string, number> = {};
    for (const [field, value] of entry.fields) {
      result[field] = value;
    }
    return result;
  }

  hset(key: string, fields: Record<string, number>): void {
    const entry = this.getHash(key) ?? { fields: new Map(), expiresAt: null };
    for (const [field, value] of Object.entries(fields)) {
      entry.fields.set(field, value);
    }
    this.hashes.set(key, entry);
    this.maybePrune();
  }

  async evalScript<T>(
    script: RateLimitScript,
    keys: string[],
    args: Array<string | number>,
  ): Promise<T> {
    // Execution is synchronous, so this is atomic with respect to other
    // requests in the same process.
    return script.run(this, keys, args.map(String)) as T;
  }

  async delete(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.strings.delete(key);
      this.hashes.delete(key);
    }
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.strings.keys()) {
      if (key.startsWith(prefix)) {
        this.strings.delete(key);
      }
    }
    for (const key of this.hashes.keys()) {
      if (key.startsWith(prefix)) {
        this.hashes.delete(key);
      }
    }
  }

  private getString(key: string): StringEntry | undefined {
    const entry = this.strings.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.strings.delete(key);
      return undefined;
    }
    return entry;
  }

  private getHash(key: string): HashEntry | undefined {
    const entry = this.hashes.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.hashes.delete(key);
      return undefined;
    }
    return entry;
  }

  /** Avoid unbounded growth from one-off identifiers. */
  private maybePrune(): void {
    this.writes += 1;
    if (this.writes % 512 !== 0) return;

    const now = Date.now();
    for (const [key, entry] of this.strings) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.strings.delete(key);
      }
    }
    for (const [key, entry] of this.hashes) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.hashes.delete(key);
      }
    }
  }
}

let defaultStore: RateLimitStore | undefined;

/**
 * Use Valkey when it is configured, otherwise fall back to per-process memory.
 * The same instance is shared by all limiters in the process.
 */
export function getDefaultStore(): RateLimitStore {
  if (defaultStore) return defaultStore;

  if (isActive && valkey) {
    defaultStore = new ValkeyRateLimitStore(valkey);
    return defaultStore;
  }

  if (process.env.NODE_ENV === "production") {
    logger.warn(
      "Valkey is not configured; rate limits are stored in memory per process. " +
        "Set LOGCHIMP_VALKEY_URL to share limits between instances.",
    );
  }

  defaultStore = new MemoryRateLimitStore();
  return defaultStore;
}
