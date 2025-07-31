import _ from "lodash";
import jwt from "jsonwebtoken";

import logchimpConfig from "../utils/logchimpConfig";
const config = logchimpConfig();

/**
 * Generate JWT token
 *
 * @param {*} data
 * @param {*} payload
 *
 * @returns {string} JWT token
 */
const createToken = (data, payload) => {
  const secretKey = process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;
  const token = jwt.sign(data, secretKey, payload);

  return token;
};

/**
 * Verify JWT token
 *
 * @param {string} token
 * @returns
 */
const verifyToken = (token) => {
  if (!_.isString(token)) {
    return null;
  }

  const secretKey = process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;
  return jwt.verify(token, secretKey);
};

export { createToken, verifyToken };
