const database = require("../../database");

// utils
const { validatePassword } = require("../../utils/password");
const { createToken } = require("../../utils/token");
const logger = require("../../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

const error = require("../../errorResponse.json");

exports.login = async (req, res) => {
	const emailAddress = req.body.emailAddress;
	const password = req.body.password;

	try {
		const users = await database
			.select("userId", "emailAddress", "password", "avatar")
			.from("users")
			.where({
				emailAddress
			})
			.limit(1);

		const user = users[0];

		if (user) {
			const validateUserPassword = await validatePassword(
				password,
				user.password
			);

			if (validateUserPassword) {
				delete user.password;

				// generate authToken
				const secretKey = config.server.secretKey;
				const authToken = createToken(user, secretKey, {
					expiresIn: "2d"
				});

				res.status(200).send({
					user: {
						...user,
						authToken
					}
				});
			} else {
				res.status(403).send({
					message: error.middleware.user.incorrectPassword,
					code: "INCORRECT_PASSWORD"
				});
			}
		} else {
			res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
