// services
const createUser = require("../../services/auth/createUser");

// utils
const logger = require("../../utils/logger");

exports.signup = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	try {
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
