// services
const createUser = require("../../services/auth/createUser");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.signup = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	try {
		const settings = await database.select().from("settings").first();

		if (!settings.allowSignup) {
			return res.status(400).send({
				message: error.api.roles.notEnoughPermission,
				code: "SIGNUP_NOT_ALLOWED"
			});
		}

		const user = await createUser(req, res, next, {
			email,
			password
		});

		res.status(201).send({ user });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
