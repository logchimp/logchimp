const jwt = require("jsonwebtoken");

// database
const database = require("../database");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
	const token = req.query.token || req.body.token;

	if (!token) {
		return res.status(400).send({
			errors: [
				!token
					? {
							message: error.api.emailVerify.tokenMissing,
							code: "MISSING_TOKEN"
					  }
					: ""
			]
		});
	}

	// validate JWT auth token
	const secretKey = config.server.secretKey;
	const decoded = await jwt.verify(token, secretKey);

	/**
	 * sending information about token expiration is for
	 * development/testing/staging environment
	 */
	const __tokenExpired =
		process.env.NODE_ENV !== "production"
			? {
					message: error.api.emailVerify.tokenExpired,
					code: "TOKEN_EXPIRED"
			  }
			: {
					message: error.api.emailVerify.invalidToken,
					code: "INVALID_TOKEN"
			  };

	// check token expiration time
	if (!(decoded.exp > decoded.iat)) {
		return res.status(401).send({ __tokenExpired });
	}

	try {
		const tokenType = decoded.type;
		const emailToken = await database
			.select()
			.from(tokenType)
			.where({ token })
			.first();

		if (!emailToken) {
			return res.status(404).send({
				message: error.api.emailVerify.invalidToken,
				code: "INVALID_TOKEN"
			});
		}

		const user = { email: emailToken.email };
		req.user = user;

		req.emailToken = emailToken;
		next();
	} catch (err) {
		logger.error(err);
	}
};
