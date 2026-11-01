import crypto from "node:crypto";

const SIGNATURE_VERSION = "v0";
/** Slack recommends rejecting requests older than 5 minutes (replay protection) */
export const SLACK_MAX_REQUEST_AGE_SECONDS = 60 * 5;

interface VerifySlackSignatureOptions {
  signingSecret: string;
  /** `X-Slack-Request-Timestamp` header */
  timestamp: string | undefined;
  /** `X-Slack-Signature` header */
  signature: string | undefined;
  /** Unparsed request body, exactly as received */
  rawBody: string | Buffer;
  /** Current time in milliseconds, overridable for tests */
  now?: number;
}

/**
 * Verify that a request was sent by Slack.
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature({
  signingSecret,
  timestamp,
  signature,
  rawBody,
  now = Date.now(),
}: VerifySlackSignatureOptions): boolean {
  if (!signingSecret || !timestamp || !signature) return false;

  const requestTime = Number.parseInt(timestamp, 10);
  if (Number.isNaN(requestTime)) return false;

  const ageInSeconds = Math.abs(Math.floor(now / 1000) - requestTime);
  if (ageInSeconds > SLACK_MAX_REQUEST_AGE_SECONDS) return false;

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const expected = `${SIGNATURE_VERSION}=${crypto
    .createHmac("sha256", signingSecret)
    .update(`${SIGNATURE_VERSION}:${timestamp}:${body}`)
    .digest("hex")}`;

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
