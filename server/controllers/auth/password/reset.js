const crypto = require("crypto");

// database
const database = require("../../../database");

// services
const getUser = require("../../../services/auth/getUser");

// utils
const logger = require("../../../utils/logger");

const error = require("../../../errorResponse.json");

exports.reset = async (req, res) => {
	const emailAddress = req.body.emailAddress;

	if (!emailAddress) {
		res.status(422).send({
			message: error.api.authentication.noEmailProvided,
			code: "NO_EMAIL_PROVIDED"
		});
	}

	try {
		const getAuthUser = await getUser(emailAddress);

		if (getAuthUser) {
			try {
				const cryptoBuffer = await crypto.randomBytes(100);

				// convert cryptoBuffer to string
				const cryptoBufferToken = cryptoBuffer.toString("hex");

				const resetPasswordExpires = Date.now() + 3600000;

				await database
					.update({
						resetPasswordToken: cryptoBufferToken,
						// add 1 hour to current time
						resetPasswordExpires,
						updatedAt: new Date().toJSON()
					})
					.from("users")
					.where({
						userId: getAuthUser.userId
					});

				res.status(200).send({
					type: "success"
				});
			} catch (err) {
				logger.error({
					err
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
