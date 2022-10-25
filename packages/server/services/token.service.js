const _ = require("lodash");
const jwt = require("jsonwebtoken");

const config = require("../utils/logchimpConfig")();

/**
 * Generate JWT token
 *
 * @param {*} data
 * @param {*} payload
 *
 * @returns {string} JWT token
 */
const createToken = (data, payload) => {
  const secretKey = config.server.secretKey;
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

  const secretKey = config.server.secretKey;
  return jwt.verify(token, secretKey);
};

module.exports = {
  createToken,
  verifyToken,
};
