// services
const createUser = require("../../services/auth/createUser");

// utils
const logger = require("../../utils/logger");

exports.signup = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email) {
		return res.status(400).send({
			message: error.api.authentication.noEmailProvided,
			code: "EMAIL_MISSING"
		});
	}

	if (!password) {
		return res.status(400).send({
			message: error.api.authentication.noPasswordProvided,
			code: "PASSWORD_MISSING"
		});
	}

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
