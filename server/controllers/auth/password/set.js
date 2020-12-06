// database
const database = require("../../../database");

// services
const validatePasswordResetToken = require("../../../services/auth/validatePasswordResetToken");

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
		const authUser = await validatePasswordResetToken(
			req,
			res,
			resetPasswordToken
		);

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
				email: authUser.email
			});

		res.status(200).send({
			type: "success"
		});
	} catch (err) {
		logger.error(err);
	}
};
