// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.userById = async (req, res) => {
	const userId = req.params.userId;

	try {
		const users = await database
			.select()
			.from("users")
			.where({
				userId
			})
			.limit(1);

		const user = users[0];

		if (user) {
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				user
			});
		} else {
			res.status(404).send({
				message: error.api.user.userNotFound,
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
