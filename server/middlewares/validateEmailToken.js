const jwt = require("jsonwebtoken");

// database
const database = require("../database");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
	const token = req.query.token;

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

	try {
		const verificationToken = await database
			.select()
			.from("emailVerification")
			.where({ token })
			.first();

		if (!verificationToken) {
			return res.status(404).send({
				message: error.api.emailVerify.invalidToken,
				code: "INVALID_TOKEN"
			});
		}

		// validate JWT auth token
		const secretKey = config.server.secretKey;
		const decodedToken = await jwt.verify(verificationToken.token, secretKey);

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
		if (!(decodedToken.exp > decodedToken.iat)) {
			return res.status(401).send({ __tokenExpired });
		}

		const user = { email: verificationToken.email };
		req.user = user;

		req.verificationToken = verificationToken;
		next();
	} catch (err) {
		logger.error(err);
	}
};
