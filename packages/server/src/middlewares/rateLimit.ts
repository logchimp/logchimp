import type { NextFunction, Request, RequestHandler, Response } from "express";

import error from "../errorResponse.json";
import type { RateLimitResult } from "../services/rateLimit/types";
import type { RateLimiter } from "../services/rateLimit/limiter";
import logger from "../utils/logger";
import { config } from "../utils/logchimpConfig";

export type RateLimitMiddlewareOptions = {
  /**
   * Derive the identifier to limit.
   *
   * Defaults to the authenticated user id, falling back to the client IP.
   * Return `null`/`undefined` to let the request through unrated.
   */
  identifier?: (req: Request) => string | null | undefined;
  /** Return `true` to bypass rate limiting for this request. */
  skip?: (req: Request) => boolean;
  /** How many tokens this request consumes. Defaults to `1`. */
  rate?: (req: Request) => number;
  /** Message of the 429 response. */
  message?: string;
  /** Code of the 429 response. */
  code?: string;
  /** Send `RateLimit-*` and `Retry-After` headers. Defaults to `true`. */
  headers?: boolean;
  /** Called when a request is rejected (logging, metrics, alerts). */
  onLimited?: (req: Request, result: RateLimitResult) => void;
};

const DEFAULT_MESSAGE = error.middleware.rateLimit.tooManyRequests;
const DEFAULT_CODE = "TOO_MANY_REQUESTS";

function defaultIdentifier(req: Request): string {
  const user = (req as Request & { user?: { userId?: string } }).user;
  return user?.userId || req.ip || req.socket.remoteAddress || "anonymous";
}

/**
 * Rate limiting is skipped in the test environments and can be disabled in
 * self-hosted setups with `LOGCHIMP_RATE_LIMIT_DISABLED=true`.
 */
function isRateLimitingDisabled(): boolean {
  return (
    process.env.NODE_ENV === "testing" ||
    process.env.NODE_ENV === "ci" ||
    config.rateLimitDisabled === true
  );
}

/** Set the standard rate limit response headers. */
export function applyRateLimitHeaders(
  res: Response,
  result: RateLimitResult,
): void {
  res.setHeader("RateLimit-Limit", String(result.limit));
  res.setHeader("RateLimit-Remaining", String(result.remaining));

  if (result.reset > 0) {
    const resetSeconds = Math.max(
      0,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    res.setHeader("RateLimit-Reset", String(resetSeconds));
  }
}

/** Send the standard 429 response for an exceeded limit. */
export function sendTooManyRequests(
  res: Response,
  result: RateLimitResult,
  options: Pick<
    RateLimitMiddlewareOptions,
    "message" | "code" | "headers"
  > = {},
): void {
  if (options.headers !== false) {
    applyRateLimitHeaders(res, result);

    if (result.reset > 0) {
      const retryAfter = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfter));
    }
  }

  res.status(429).send({
    message: options.message ?? DEFAULT_MESSAGE,
    code: options.code ?? DEFAULT_CODE,
  });
}

/**
 * Express middleware adapter.
 *
 * @example
 * router.post("/auth/login", rateLimit(authRateLimiter), controller.login);
 */
export function rateLimit(
  limiter: RateLimiter,
  options: RateLimitMiddlewareOptions = {},
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (isRateLimitingDisabled() || options.skip?.(req)) {
      next();
      return;
    }

    const identifier = options.identifier
      ? options.identifier(req)
      : defaultIdentifier(req);

    if (!identifier) {
      next();
      return;
    }

    let result: RateLimitResult;
    try {
      result = await limiter.limit(identifier, {
        rate: options.rate?.(req),
      });
    } catch (err) {
      // Invalid configuration (e.g. non-integer rate) should not break the API.
      logger.error({
        message: "rate limit middleware failed, allowing request",
        error: err,
      });
      next();
      return;
    }

    if (options.headers !== false) {
      applyRateLimitHeaders(res, result);
    }

    if (result.success) {
      next();
      return;
    }

    options.onLimited?.(req, result);
    sendTooManyRequests(res, result, options);
  };
}
