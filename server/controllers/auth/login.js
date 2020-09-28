// services
const getUser = require("../../services/auth/getUser");

// utils
const { validatePassword } = require("../../utils/password");
const { createToken } = require("../../utils/token");

const error = require("../../errorResponse.json");

exports.login = async (req, res) => {
	const emailAddress = req.body.emailAddress;
	const password = req.body.password;

	const getAuthUser = await getUser(emailAddress);

	try {
		if (getAuthUser) {
			const validateUserPassword = await validatePassword(
				password,
				getAuthUser.password
			);

			if (validateUserPassword) {
				delete getAuthUser.password;
				const authToken = createToken(getAuthUser, process.env.SECRET_KEY, {
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
	} catch (error) {
		console.error(error);
	}
};
