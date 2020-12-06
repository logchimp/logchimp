// services
const getUser = require("../../../services/auth/getUser");
const passwordResetEmail = require("../../../services/auth/passwordReset");

// utils
const logger = require("../../../utils/logger");

const error = require("../../../errorResponse.json");

exports.reset = async (req, res) => {
	const email = req.body.email;

	if (!email) {
		res.status(422).send({
			message: error.api.authentication.noEmailProvided,
			code: "EMAIL_ADDRESS_NOT_PROVIDED"
		});
	}

	try {
		const getAuthUser = await getUser(email);

		if (!getAuthUser) {
			res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}

		// user blocked
		if (getAuthUser.isBlocked) {
			res.status(403).send({
				message: error.middleware.user.userBlocked,
				code: "USER_BLOCKED"
			});
		}

		const tokenData = {
			userId: getAuthUser.userId,
			email: getAuthUser.email
		};

		const url = req.headers.origin;
		await passwordResetEmail(url, tokenData);

		res.status(200).send({
			type: "success"
		});
	} catch (err) {
		logger.error(err);
	}
};
