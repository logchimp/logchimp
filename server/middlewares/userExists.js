const database = require("../database");

// utils
const logger = require("../utils/logger");
const error = require("../errorResponse.json");

module.exports = async (req, res, next) => {
	const email = req.body.email || req.user.email;

	try {
		const user = await database
			.select("u.*", "r.name")
			.from("users AS u")
			.where({
				email
			})
			.leftJoin("roles_users AS ru", "u.userId", "=", "ru.user_id")
			.leftJoin("permissions_roles AS pr", "ru.role_id", "=", "pr.role_id")
			.leftJoin("roles AS r", "ru.role_id", "=", "r.id")
			.groupBy("u.userId", "ru.role_id", "r.name")
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
