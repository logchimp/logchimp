// services
const validatePasswordResetToken = require("../../../services/auth/validatePasswordResetToken");

// utils
const logger = require("../../../utils/logger");

exports.validateToken = async (req, res) => {
	const token = req.body.token;

	try {
		const response = await validatePasswordResetToken(req, res, token);

		if (response) {
			res.sendStatus(200);
		}
	} catch (err) {
		logger.error(err);
	}
};
