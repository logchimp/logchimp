const jwt = require("jsonwebtoken");

// database
const database = require("../../database");

// services
const getUser = require("../../services/auth/getUser");

// utils
const logger = require("../../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const error = require("../../errorResponse.json");

const validatePasswordResetToken = async (req, res, token) => {
	try {
		const getTokenFromDatabase = await database
			.select()
			.from("resetPassword")
			.where({ token })
			.limit(1);

		const tokenFromDatabase = getTokenFromDatabase[0];
		if (!tokenFromDatabase) {
			res.status(404).send({
				message: error.api.passwordReset.invalidToken,
				code: "INVALID_PASSWORD_RESET_TOKEN"
			});
			return;
		}

		// validate JWT auth token
		const secretKey = config.server.secretKey;
		const decodedToken = await jwt.verify(tokenFromDatabase.token, secretKey);

		// check token expiration time
		if (!(decodedToken.exp > decodedToken.iat)) {
			res.status(410).send({
				message: error.api.passwordReset.expired,
				code: "PASSWORD_RESET_EXPIRED"
			});
			return;
		}

		const email = tokenFromDatabase.email;

		const authUser = await getUser(email);

		// user not found
		if (!authUser) {
			res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
			return;
		}

		// user blocked
		if (authUser.isBlocked) {
			res.status(403).send({
				message: error.middleware.user.userBlocked,
				code: "USER_BLOCKED"
			});
			return;
		}

		return authUser;
	} catch (err) {
		logger.error(err);
	}
};

module.exports = validatePasswordResetToken;
