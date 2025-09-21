import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { configManager } from "../utils/logchimpConfig";
const config = configManager.getConfig();

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
  return jwt.sign(data, config.secretKey, payload);
};

/**
 * Verify JWT token
 *
 * @param {string} token
 * @returns
 */
const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, config.secretKey);
};

export { createToken, verifyToken };
