// packages/server/src/utils/envValidator.ts

/**
 * Safely parse boolean-like environment variables.
 * Accepts "true" / "false" (case-insensitive) or actual booleans.
 * Returns defaultValue if value is undefined or empty.
 */
export function parseBooleanEnv(
  value: string | undefined,
  defaultValue = false
): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error(
    `Invalid boolean environment variable value: "${value}". Expected "true" or "false".`
  );
}

/**
 * Safely parse numeric environment variables.
 */
export function parseNumberEnv(
  value: string | undefined,
  defaultValue?: number
): number {
  if (value === undefined || value.trim() === "") {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Required numeric environment variable is missing.`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number environment variable value: "${value}".`);
  }
  return parsed;
}

/**
 * Ensure required environment variable is set (non-empty string).
 */
export function validateRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Get SSL configuration for database connection.
 */
export function getSslConfig() {
  const useSSL = parseBooleanEnv(process.env.LOGCHIMP_DB_SSL, false);

  if (!useSSL) return false;

  return {
    rejectUnauthorized: parseBooleanEnv(
      process.env.LOGCHIMP_DB_REJECT_UNAUTHORIZED,
      true
    ),
  };
}
