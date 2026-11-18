import { fixedWindow, slidingWindow, tokenBucket } from "./algorithms";
import { RateLimiter } from "./limiter";

/**
 * Rate limit policies for the API.
 *
 * All policies live here so they can be reviewed, tuned and reused. Each one
 * has its own prefix, which namespaces its keys in Valkey/in-memory storage.
 *
 * Identifiers:
 * - `apiRateLimiter` / `authRateLimiter`: client IP (no auth at that point)
 * - `writeRateLimiter`: authenticated user id
 */
const PREFIX = "@logchimp/ratelimit";

/**
 * Baseline limit for every `/api` request. Protects the whole API from
 * scraping and accidental request storms.
 *
 * 300 requests per minute per IP.
 */
export const apiRateLimiter = new RateLimiter({
  limiter: slidingWindow(300, "1 m"),
  prefix: `${PREFIX}:api`,
});

/**
 * Strict limit for authentication endpoints (login, signup, password reset,
 * email verification). Slows down credential stuffing and email spam.
 *
 * 20 requests per minute per IP.
 */
export const authRateLimiter = new RateLimiter({
  limiter: slidingWindow(20, "1 m"),
  prefix: `${PREFIX}:auth`,
});

/**
 * Limit for state-changing endpoints (posts, votes, comments). Also smooths
 * bursts rather than hard cutting at a window boundary.
 *
 * 60 writes per minute per user, burst up to 60.
 */
export const writeRateLimiter = new RateLimiter({
  limiter: tokenBucket(60, "1 m", 60),
  prefix: `${PREFIX}:write`,
});

/**
 * Example of a per-action limit: voting is cheap individually, but can be
 * abused by scripts. Kept separate from other writes so a burst of votes does
 * not prevent a user from creating a post.
 *
 * 30 votes per minute per user.
 */
export const voteRateLimiter = new RateLimiter({
  limiter: fixedWindow(30, "1 m"),
  prefix: `${PREFIX}:vote`,
});

/**
 * Example of a limit for an expensive/abusable action: sending email.
 *
 * 5 emails per hour per user.
 */
export const emailRateLimiter = new RateLimiter({
  limiter: fixedWindow(5, "1 h"),
  prefix: `${PREFIX}:email`,
});
