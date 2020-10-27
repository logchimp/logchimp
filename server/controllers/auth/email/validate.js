const jwt = require("jsonwebtoken");

// database
const database = require("../../../database");

// services
const getUser = require("../../../services/auth/getUser");

// utils
const logger = require("../../../utils/logger");
const logchimpConfig = require("../../../utils/logchimpConfig");
const config = logchimpConfig();
const error = require("../../../errorResponse.json");

exports.validate = async (req, res) => {
	const token = req.body.token;

	if (!token) {
		res.status(422).send({
			message: error.api.emailVerify.tokenMissing,
			code: "EMAIL_VERIFICATION_TOKEN_MISSING"
		});
	}

	try {
		const getTokenFromDatabase = await database
			.select()
			.from("emailVerification")
			.where({ token })
			.limit(1);

		const tokenFromDatabase = getTokenFromDatabase[0];
		if (!tokenFromDatabase) {
			res.status(404).send({
				message: error.api.emailVerify.invalidToken,
				code: "EMAIL_VERIFICATION_TOKEN_INVALID"
			});
		}

		// validate JWT auth token
		const secretKey = config.server.secretKey;
		const decodedToken = await jwt.verify(tokenFromDatabase.token, secretKey);

		// check token expiration time
		if (!(decodedToken.exp > decodedToken.iat)) {
			res.status(410).send({
				message: error.api.emailVerify.expired,
				code: "EMAIL_VERIFICATION_TOKEN_EXPIRED"
			});
		}

		const emailAddress = tokenFromDatabase.emailAddress;

		try {
			const authUser = await getUser(emailAddress);

			// user not found
			if (!authUser) {
				res.status(404).send({
					message: error.middleware.user.userNotFound,
					code: "USER_NOT_FOUND"
				});
			}

			// user blocked
			if (authUser.isBlocked) {
				res.status(403).send({
					message: error.middleware.user.userBlocked,
					code: "USER_BLOCKED"
				});
			}

			if (authUser.isVerified) {
				res.status(402).send({
					message: error.api.emailVerify.verified,
					code: "USER_ALREADY_VERIFIED"
				});
			}

			const userVerified = await database
				.update({
					isVerified: true
				})
				.from("users")
				.where({
					emailAddress: decodedToken.emailAddress
				})
				.returning("*");

			delete userVerified[0].password;
			delete userVerified[0].createdAt;
			delete userVerified[0].updatedAt;

			res.status(200).send(userVerified);
		} catch (err) {
			logger.error(err);
		}
	} catch (err) {
		logger.error(err);
	}
};
