// services
const createUser = require("../../services/auth/createUser");

// utils
const logger = require("../../utils/logger");

exports.signup = async (req, res, next) => {
	const emailAddress = req.body.emailAddress;
	const password = req.body.password;

	try {
		const user = await createUser(req, res, next, {
			emailAddress,
			password
		});

		res.status(201).send(user);
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
