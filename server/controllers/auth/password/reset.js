// database
const database = require("../../../database");

// services
const getUser = require("../../../services/auth/getUser");
const passwordResetEmail = require("../../../services/auth/passwordReset");

// utils
const logger = require("../../../utils/logger");

const error = require("../../../errorResponse.json");

exports.reset = async (req, res) => {
	const emailAddress = req.body.emailAddress;

	if (!emailAddress) {
		res.status(422).send({
			message: error.api.authentication.noEmailProvided,
			code: "EMAIL_ADDRESS_NOT_PROVIDED"
		});
	}

	try {
		const getAuthUser = await getUser(emailAddress);

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
			emailAddress: getAuthUser.emailAddress
		};

		const siteUrl = req.headers.origin;
		await passwordResetEmail(siteUrl, tokenData);

		res.status(200).send({
			type: "success"
		});
	} catch (err) {
		logger.error(err);
	}
};
