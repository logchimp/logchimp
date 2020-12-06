// database
const database = require("../../../database");

// services
const getUser = require("../../../services/auth/getUser");
const verifyEmail = require("../../../services/auth/verifyEmail");

// utils
const logger = require("../../../utils/logger");

const error = require("../../../errorResponse.json");

exports.verify = async (req, res) => {
	const email = req.body.email;

	try {
		const authUser = await getUser(email);

		// user not found
		if (!authUser) {
			res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}

		// user blocked
		if (authUser.isBlocked) {
			res.status(403).send({
				message: error.middleware.user.userBlocked,
				code: "USER_BLOCKED"
			});
		}

		// check email verify status of user
		const isUserVerified = await database
			.select("isVerified")
			.from("users")
			.where({
				email
			})
			.limit(1);

		const user = isUserVerified[0];

		if (!user.isVerified) {
			const url = req.headers.origin;
			const emailVerification = await verifyEmail(url, email);

			res.status(200).send({
				emailVerification
			});
		} else {
			res.send(409).send({
				message: error.api.mail.emailVerified,
				code: "USER_EMAIL_VERIFIED"
			});
		}
	} catch (err) {
		logger.error({
			err
		});
	}
};
