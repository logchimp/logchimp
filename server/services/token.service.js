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

module.exports = {
	createToken
};
