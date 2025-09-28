import _ from "lodash";
import { validate as validateUUID } from "uuid";
import fs from "fs";
import { isEmail } from "validator";
import { OFFSET_PAGINATION_UPPER_LIMIT } from "./constants";
import { customAlphabet } from "nanoid";

/**
 * Check value is valid email
 *
 * @param {string} email
 * @returns boolean
 */
const validEmail = (email: string): boolean => {
  if (!email) return false;
  return isEmail(email);
};

/**
 * Check value is valid UUID or not
 *
 * @param {*} value The value to check
 * @returns {*} Returns valid UUID
 */
const validUUID = (value?: string | null): string | null =>
  value && validateUUID(value) ? value : null;

/**
 * Validates a list of UUIDs
 */
function validUUIDs(value: Array<string>): string[] {
  if (!value.length) return [];

  const result: string[] = [];
  for (let i = 0, len = value.length; i < len; i++) {
    if (validateUUID(value[i])) {
      result.push(value[i]);
    }
  }
  return result;
}

/**
 * Create random 6 digital HEX color
 *
 * @returns Return HEX color
 */
const generateHexColor = () => {
  let random = Math.random();
  // @ts-ignore
  const exponent = --random.toExponential().split("-")[1];
  // Make sure random number is between 1.0 and 0.1 to assure correct hex values.
  random *= 10 ** exponent;
  return (~~(random * (1 << 24))).toString(16);
};

/**
 * Sanitise username
 *
 * @param {string} value username
 * @returns {string} Return username without any special character
 */
const sanitiseUsername = (value) => {
  if (value == null || !_.isString(value) || value.length > 30) {
    return "";
  }

  return value.replace(/^_+/, "").replace(/[^a-zA-Z0-9._-]/g, "");
};

/**
 * Sanitise name
 *
 * @param {string} value name
 * @returns {string} Return name without any special character
 */
const sanitiseName = (value) => {
  if (value == null || !_.isString(value)) {
    return "";
  }

  return value.replace(/[^a-zA-Z .'-]/g, "").trim();
};

/**
 * Sanitise URL
 *
 * @param {string} value url
 * @returns {string} Return sanitised url
 */
const sanitiseURL = (value: string): string => {
  if (value == null || !_.isString(value)) {
    return "";
  }

  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/^_+|\W+|[^\w]|\s/g, "-");
};

/**
 * Convert string to slug
 *
 * @param {string} value
 * @returns {string} slug
 */
const toSlug = (value) => {
  if (value == null || !_.isString(value)) {
    return "";
  }

  return value
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-");
};

function readFile(path: string): Promise<string | Error> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

const isDevTestEnv =
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "testing" ||
  process.env.NODE_ENV === "ci";

/**
 * Parses and validates the value, returning a positive integer
 * Default to 1, if the value is missing, invalid, or out of range.
 * @param {string} [value] - The page value to be parsed and validated, optional.
 * @return {number} The validated page number, defaulted to 1 if invalid or out of range.
 */
function parseAndValidatePage(value?: string) {
  if (!value) return 1;
  const n = value ? +value : NaN;
  // Default to page 1; coerce invalid/NaN/<=0 to 1
  return Math.min(
    !Number.isNaN(n) && n > 0 ? Math.floor(n) : 1,
    OFFSET_PAGINATION_UPPER_LIMIT,
  );
}

/**
 * Parses a string to a positive integer, clamped to the maximum limit.
 * Returns max for invalid/empty values or numbers ≤ 0.
 * @param {string} value
 * @param {number} max
 * @returns {number}
 */
function parseAndValidateLimit(value: string, max: number): number {
  if (!value) return max;
  const _value = +value;
  if (_value === 0) return 0;
  return _value > 0 ? Math.min(Math.floor(_value), max) : max;
}

/**
 * Random ID generator using nanoid.
 * Returns random ID based on param length.
 * @param {number} length
 * @returns {string}
 */
function generateNanoID(length: number): string {
  // Generate nanoid only with [_0-9a-z]
  const allowedChars = "_0123456789abcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(
    allowedChars,
    Math.min(Math.max(length, 2), allowedChars.length),
  );
  return nanoid();
}

export {
  validEmail,
  validUUID,
  validUUIDs,
  generateHexColor,
  sanitiseUsername,
  sanitiseName,
  sanitiseURL,
  toSlug,
  readFile,
  isDevTestEnv,
  parseAndValidatePage,
  parseAndValidateLimit,
  generateNanoID,
};
