import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import logchimpConfig from "../utils/logchimpConfig";

const config = logchimpConfig();

/**
 * Generate JWT token
 *
 * @param {object} data
 * @param {SignOptions} payload
 * @returns {string} JWT token
 */
const createToken = (
  data: string | Buffer | object,
  payload: SignOptions,
): string => {
  const secretKey = process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;
  return jwt.sign(data, secretKey, payload);
};

/**
 * Verify JWT token
 *
 * @param {string} token
 * @returns
 */
const verifyToken = (token: string): JwtPayload | string => {
  const secretKey = process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;
  return jwt.verify(token, secretKey);
};

export { createToken, verifyToken };
