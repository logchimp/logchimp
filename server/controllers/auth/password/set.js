const jwt = require("jsonwebtoken");

// database
const database = require("../../../database");

// services
const getUser = require("../../../services/auth/getUser");

// utils
const { hashPassword } = require("../../../utils/password");
const logger = require("../../../utils/logger");
const logchimpConfig = require("../../../utils/logchimpConfig");
const config = logchimpConfig();

const error = require("../../../errorResponse.json");

exports.set = async (req, res) => {
	const resetPasswordToken = req.body.resetPasswordToken;
	const password = req.body.password;

	if (!resetPasswordToken) {
		res.status(422).send({
			message: error.api.passwordReset.missingToken,
			code: "PASSWORD_RESET_TOKEN_MISSING"
		});
	}

	if (!password) {
		res.status(422).send({
			message: error.api.authentication.noPasswordProvided,
			code: "NO_PASSWORD_PROVIDED"
		});
	}

	try {
		const getTokenFromDatabase = await database
			.select()
			.from("resetPassword")
			.where({ token: resetPasswordToken })
			.limit(1);

		const tokenFromDatabase = getTokenFromDatabase[0];

		if (!tokenFromDatabase) {
			res.status(403).send({
				message: error.api.passwordReset.invalidToken,
				code: "INVALID_PASSWORD_RESET_TOKEN"
			});
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

			const hashedPassword = hashPassword(password);

			await database
				.update({
					password: hashedPassword,
					updatedAt: new Date().toJSON()
				})
				.from("users")
				.where({
					userId: authUser.userId
				});

			await database
				.delete()
				.from("resetPassword")
				.where({
					emailAddress
				});

			res.status(200).send({
				type: "success"
			});
		} catch (err) {
			logger.error(err);
		}
	} catch (err) {
		logger.error(err);
	}
};
