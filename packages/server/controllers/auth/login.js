// utils
const { validatePassword } = require("../../utils/password");
const { createToken } = require("../../utils/token");
const logger = require("../../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();
const error = require("../../errorResponse.json");

exports.login = async (req, res) => {
	const user = req.user;
	const password = req.body.password;

	if (!password) {
		return res.status(400).send({
			errors: [
				!password
					? {
							message: error.api.authentication.noPasswordProvided,
							code: "PASSWORD_MISSING"
					  }
					: ""
			]
		});
	}

	try {
		const validateUserPassword = await validatePassword(
			password,
			user.password
		);
		if (!validateUserPassword) {
			return res.status(403).send({
				message: error.middleware.user.incorrectPassword,
				code: "INCORRECT_PASSWORD"
			});
		}

		// generate authToken
		const tokenPayload = {
			userId: user.userId,
			email: user.email
		};
		const secretKey = config.server.secretKey;
		const authToken = createToken(tokenPayload, secretKey, {
			expiresIn: "2d"
		});

		res.status(200).send({
			user: {
				authToken,
				userId: user.userId,
				name: user.name,
				username: user.username,
				email: user.email,
				avatar: user.avatar
			}
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
