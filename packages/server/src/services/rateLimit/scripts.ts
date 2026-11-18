import type { RateLimitScript } from "./types";

/**
 * Fixed window: one counter per window, reset by TTL.
 *
 * KEYS[1] - counter key (identifier + window bucket)
 * ARGV[1] - increment (tokens consumed by this request)
 * ARGV[2] - window size in milliseconds
 */
export const fixedWindowLimitScript: RateLimitScript = {
  name: "fixedWindowLimit",
  lua: `
local key = KEYS[1]
local incrementBy = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local used = redis.call("INCRBY", key, incrementBy)
if used == incrementBy then
  -- First request in this window, start the TTL only once.
  redis.call("PEXPIRE", key, window)
end

return used
`,
  run: (state, [key], [incrementBy, window]) => {
    const increment = Number(incrementBy);
    const used = state.incrBy(key, increment);
    if (used === increment) {
      state.pexpire(key, Number(window));
    }
    return used;
  },
};

/**
 * Fixed window: read the counter without incrementing it.
 *
 * KEYS[1] - counter key
 */
export const fixedWindowPeekScript: RateLimitScript = {
  name: "fixedWindowPeek",
  lua: `
local used = tonumber(redis.call("GET", KEYS[1]) or "0")
return used
`,
  run: (state, [key]) => state.get(key) ?? 0,
};

/**
 * Sliding window: weighted average of the current and previous window.
 *
 * KEYS[1] - current window counter
 * KEYS[2] - previous window counter
 * ARGV[1] - maximum tokens
 * ARGV[2] - current timestamp in milliseconds
 * ARGV[3] - window size in milliseconds
 * ARGV[4] - increment (tokens consumed by this request)
 *
 * Returns the number of tokens left, or `-1` when the limit was exceeded.
 */
export const slidingWindowLimitScript: RateLimitScript = {
  name: "slidingWindowLimit",
  lua: `
local currentKey = KEYS[1]
local previousKey = KEYS[2]
local limit = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
local incrementBy = tonumber(ARGV[4])

local current = tonumber(redis.call("GET", currentKey) or "0")
local previous = tonumber(redis.call("GET", previousKey) or "0")

-- How far we are into the current window (0 = just started, 1 = almost over).
local percentageInCurrent = (now % window) / window
-- Older requests carry less and less weight as the current window progresses.
previous = math.floor((1 - percentageInCurrent) * previous)

-- Only reject when consuming, not when refunding (negative rate).
if incrementBy > 0 and previous + current >= limit then
  return -1
end

local newValue = redis.call("INCRBY", currentKey, incrementBy)
if newValue == incrementBy then
  -- Keep the key around long enough to also act as the previous window.
  redis.call("PEXPIRE", currentKey, window * 2 + 1000)
end

return limit - (newValue + previous)
`,
  run: (state, [currentKey, previousKey], args) => {
    const limit = Number(args[0]);
    const now = Number(args[1]);
    const window = Number(args[2]);
    const incrementBy = Number(args[3]);

    const current = state.get(currentKey) ?? 0;
    let previous = state.get(previousKey) ?? 0;

    const percentageInCurrent = (now % window) / window;
    previous = Math.floor((1 - percentageInCurrent) * previous);

    if (incrementBy > 0 && previous + current >= limit) {
      return -1;
    }

    const newValue = state.incrBy(currentKey, incrementBy);
    if (newValue === incrementBy) {
      state.pexpire(currentKey, window * 2 + 1000);
    }

    return limit - (newValue + previous);
  },
};

/**
 * Sliding window: read the remaining tokens without consuming any.
 *
 * KEYS[1] - current window counter
 * KEYS[2] - previous window counter
 * ARGV[1] - maximum tokens
 * ARGV[2] - current timestamp in milliseconds
 * ARGV[3] - window size in milliseconds
 */
export const slidingWindowPeekScript: RateLimitScript = {
  name: "slidingWindowPeek",
  lua: `
local currentKey = KEYS[1]
local previousKey = KEYS[2]
local limit = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local window = tonumber(ARGV[3])

local current = tonumber(redis.call("GET", currentKey) or "0")
local previous = tonumber(redis.call("GET", previousKey) or "0")

local percentageInCurrent = (now % window) / window
previous = math.floor((1 - percentageInCurrent) * previous)

return limit - (current + previous)
`,
  run: (state, [currentKey, previousKey], args) => {
    const limit = Number(args[0]);
    const now = Number(args[1]);
    const window = Number(args[2]);

    const current = state.get(currentKey) ?? 0;
    let previous = state.get(previousKey) ?? 0;

    const percentageInCurrent = (now % window) / window;
    previous = Math.floor((1 - percentageInCurrent) * previous);

    return limit - (current + previous);
  },
};

/**
 * Token bucket: a bucket of `maxTokens` that refills by `refillRate` tokens
 * every `interval` milliseconds.
 *
 * KEYS[1] - bucket key
 * ARGV[1] - maximum tokens
 * ARGV[2] - refill interval in milliseconds
 * ARGV[3] - tokens added per interval
 * ARGV[4] - current timestamp in milliseconds
 * ARGV[5] - tokens consumed by this request
 *
 * Returns `{ remaining, reset }`, or `{ -1, reset }` when the limit was
 * exceeded.
 */
export const tokenBucketLimitScript: RateLimitScript = {
  name: "tokenBucketLimit",
  lua: `
local key = KEYS[1]
local maxTokens = tonumber(ARGV[1])
local interval = tonumber(ARGV[2])
local refillRate = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local incrementBy = tonumber(ARGV[5])

local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

local refilledAt
local tokens

if bucket[1] == false then
  -- New bucket: starts full, so bursts are allowed.
  refilledAt = now
  tokens = maxTokens
else
  refilledAt = tonumber(bucket[1])
  tokens = tonumber(bucket[2])
end

if now >= refilledAt + interval then
  local numRefills = math.floor((now - refilledAt) / interval)
  tokens = math.min(maxTokens, tokens + numRefills * refillRate)
  refilledAt = refilledAt + numRefills * interval
end

-- Only reject when consuming, not when refunding (negative rate).
if incrementBy > 0 and tokens < incrementBy then
  return { -1, refilledAt + interval }
end

local remaining = tokens - incrementBy
local expireAt = math.ceil((maxTokens - remaining) / refillRate) * interval

redis.call("HSET", key, "refilledAt", refilledAt, "tokens", remaining)
if expireAt > 0 then
  redis.call("PEXPIRE", key, expireAt)
end

return { remaining, refilledAt + interval }
`,
  run: (state, [key], args) => {
    const maxTokens = Number(args[0]);
    const interval = Number(args[1]);
    const refillRate = Number(args[2]);
    const now = Number(args[3]);
    const incrementBy = Number(args[4]);

    const bucket = state.hgetall(key);
    const hasBucket =
      bucket.refilledAt !== undefined && bucket.tokens !== undefined;

    let refilledAt = hasBucket ? bucket.refilledAt : now;
    let tokens = hasBucket ? bucket.tokens : maxTokens;

    if (now >= refilledAt + interval) {
      const numRefills = Math.floor((now - refilledAt) / interval);
      tokens = Math.min(maxTokens, tokens + numRefills * refillRate);
      refilledAt = refilledAt + numRefills * interval;
    }

    if (incrementBy > 0 && tokens < incrementBy) {
      return [-1, refilledAt + interval];
    }

    const remaining = tokens - incrementBy;
    const expireAt = Math.ceil((maxTokens - remaining) / refillRate) * interval;

    state.hset(key, { refilledAt, tokens: remaining });
    if (expireAt > 0) {
      state.pexpire(key, expireAt);
    }

    return [remaining, refilledAt + interval];
  },
};

/**
 * Token bucket: read the bucket without consuming tokens.
 *
 * KEYS[1] - bucket key
 * ARGV[1] - maximum tokens
 *
 * Returns `{ tokens, -1 }` when the bucket does not exist yet.
 */
export const tokenBucketPeekScript: RateLimitScript = {
  name: "tokenBucketPeek",
  lua: `
local key = KEYS[1]
local maxTokens = tonumber(ARGV[1])

local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

if bucket[1] == false then
  return { maxTokens, -1 }
end

return { tonumber(bucket[2]), tonumber(bucket[1]) }
`,
  run: (state, [key], args) => {
    const maxTokens = Number(args[0]);
    const bucket = state.hgetall(key);

    if (bucket.refilledAt === undefined) {
      return [maxTokens, -1];
    }

    return [bucket.tokens, bucket.refilledAt];
  },
};
