// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.updateUser = async (req, res) => {
	const userId = req.body.userId;
	const name = req.body.name;

	try {
		const users = await database
			.update({
				name,
				updatedAt: new Date().toJSON()
			})
			.from("users")
			.where({
				userId
			})
			.returning("*");

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
