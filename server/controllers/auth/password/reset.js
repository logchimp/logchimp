// services
const passwordResetEmail = require("../../../services/auth/passwordReset");

// utils
const logger = require("../../../utils/logger");

exports.reset = async (req, res) => {
	const { userId, email } = req.user;

	try {
		const tokenPayload = {
			userId,
			email,
			type: "resetPassword"
		};
		const url = req.headers.origin;
		const passwordReset = await passwordResetEmail(url, tokenPayload);

		/**
		 * sending token as response for
		 * development/testing/staging environment
		 */
		const __token =
			process.env.NODE_ENV !== "production"
				? {
						...passwordReset
				  }
				: "";

		res.status(200).send({
			reset: {
				success: !!passwordReset,
				...__token
			}
		});
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
