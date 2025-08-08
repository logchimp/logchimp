import _ from "lodash";
import { validate as validateUUID } from "uuid";
import fs from "fs";

/**
 * Check value is valid email
 *
 * @param {string} email
 * @returns boolean
 */
const validEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi.test(
    email,
  );

/**
 * Check value is valid UUID or not
 *
 * @param {*} value The value to check
 * @returns {*} Returns valid UUID
 */
const validUUID = (value?: string | string[] | null): string | string[] => {
  if (value == null) {
    return "";
  }

  if (_.isArray(value)) {
    const arr = value.map((item) => (validateUUID(item) ? item : ""));
    const newArr = _.filter(arr);
    return _.isEmpty(newArr) ? "" : newArr;
  }

  if (typeof value === "string") {
    return validateUUID(value) ? value : "";
  }
};

/**
 * Validates a list of UUIDs
 */
function validUUIDs(value: Array<string>): string[] {
  return value.filter((item) => validateUUID(item));
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
  if (value == null || !_.isString(value)) {
    return "";
  }

  return value.replace(/^_+|\W+|[^\w]|\s/g, "");
};

/**
 * Check if the username contains illegal content (HTML, JavaScript, SQL)
 * @param {string} value username
 * @returns {boolean} - If it contains illegal content, return true; otherwise, return false
 */
const validUsername = (value) => {
    // HTML, JS, and SQL injection features
    const invalidPatterns = [
        // HTML
        /<\/?[^>]+>/gi,
        // JavaScript
        /script\s*:/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        // SQL
        /union\s+select/gi,
        /insert\s+into/gi,
        /update\s+.+set/gi,
        /delete\s+from/gi,
        /select\s+.+from/gi,
        /drop\s+(table|database)/gi,
        /exec\s*\(/gi,
        /xp_cmdshell/gi,
        /--/gi,
        /;/gi,
        /'/gi,
        /"/gi
    ];
    return invalidPatterns.some(pattern => pattern.test(value));
}

/**
 * Sanitise URL
 *
 * @param {string} value url
 * @returns {string} Return sanitised url
 */
const sanitiseURL = (value) => {
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

export {
  validEmail,
  validUUID,
  validUUIDs,
  validUsername,
  generateHexColor,
  sanitiseUsername,
  sanitiseURL,
  toSlug,
  readFile,
};
