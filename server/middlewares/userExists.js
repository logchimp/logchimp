const database = require("../database");

// utils
const logger = require("../utils/logger");
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
	const email =
		(req.body ? req.body.email : "") || (req.user ? req.user.email : "");

	if (!email) {
		return res.status(400).send({
			errors: [
				!email
					? {
							message: error.api.authentication.noEmailProvided,
							code: "EMAIL_MISSING"
					  }
					: ""
			]
		});
	}

	try {
		const user = await database
			.select()
			.from("users")
			.where({
				email
			})
			.first();

		if (!user) {
			return res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}

		req.user = user;
		next();
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
