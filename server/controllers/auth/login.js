// services
const getUser = require("../../services/auth/getUser");

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
		const getAuthUser = await getUser(emailAddress);

		if (getAuthUser) {
			const validateUserPassword = await validatePassword(
				password,
				getAuthUser.password
			);

			if (validateUserPassword) {
				delete getAuthUser.password;

				// generate authToken
				const secretkey = config.server.secretkey;
				const authToken = createToken(getAuthUser, secretkey, {
					expiresIn: "2d"
				});

				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					user: {
						...getAuthUser,
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
