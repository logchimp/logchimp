// services
const verifyEmail = require("../../../services/auth/verifyEmail");

// utils
const logger = require("../../../utils/logger");
const error = require("../../../errorResponse.json");

exports.verify = async (req, res) => {
	const user = req.user;

	if (user.isVerified) {
		return res.status(409).send({
			message: error.api.emailVerify.emailAlreadyVerified,
			code: "EMAIL_VERIFIED"
		});
	}

	try {
		const url = req.headers.origin;
		const emailVerification = await verifyEmail(url, user.email);

		/**
		 * sending token as response is for
		 * development/testing/staging environment
		 */
		const __token =
			process.env.NODE_ENV !== "production"
				? {
						...emailVerification
				  }
				: "";

		res.status(200).send({
			verify: {
				success: !!emailVerification,
				...__token
			}
		});
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
