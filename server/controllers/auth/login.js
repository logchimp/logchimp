const database = require("../../database");

// utils
const { validatePassword } = require("../../utils/password");
const { createToken } = require("../../utils/token");
const logger = require("../../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

const error = require("../../errorResponse.json");

exports.login = async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	try {
		const user = await database
			.select("userId", "name", "email", "password", "avatar")
			.from("users")
			.where({
				email
			})
			.first();

		if (!user) {
			return res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}

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
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
