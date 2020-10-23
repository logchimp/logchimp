// database
const database = require("../../../database");

// utils
const { hashPassword } = require("../../../utils/password");
const logger = require("../../../utils/logger");

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
		// generate a token from resetPasswordToken
		const getUserByResetPasswordToken = await database
			.select()
			.column([
				"userId",
				"emailAddress",
				"resetPasswordToken",
				"resetPasswordExpires"
			])
			.from("users")
			.where({
				resetPasswordToken
			})
			.limit(1);

		const resetPasswordUser = getUserByResetPasswordToken[0];

		// check for reset password token exists in database
		if (resetPasswordUser) {
			// reset password token expiry date
			if (resetPasswordUser.resetPasswordExpires > Date.now()) {
				// password hashing
				const hashedPassword = hashPassword(password);

				await database
					.update({
						password: hashedPassword,
						resetPasswordToken: null,
						resetPasswordExpires: null,
						updatedAt: new Date().toJSON()
					})
					.from("users")
					.where({
						userId: resetPasswordUser.userId
					});

				res.status(200).send({
					type: "success"
				});
			} else {
				await database
					.update({
						resetPasswordToken: null,
						resetPasswordExpires: null,
						updatedAt: new Date().toJSON()
					})
					.from("users")
					.where({
						userId: resetPasswordUser.userId
					});

				res.status(410).send({
					message: error.api.passwordReset.expired,
					code: "PASSWORD_RESET_EXPIRED"
				});
			}
		} else {
			await database
				.update({
					resetPasswordToken: null,
					resetPasswordExpires: null,
					updatedAt: new Date().toJSON()
				})
				.from("users")
				.where({
					userId: resetPasswordUser.userId
				});

			res.status(403).send({
				message: error.api.passwordReset.invalidToken,
				code: "INVALID_PASSWORD_RESET_TOKEN"
			});
		}
	} catch (err) {
		logger.error({
			err
		});
	}
};
