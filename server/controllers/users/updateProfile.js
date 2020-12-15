// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const userId = req.user.userId;

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
			.returning(["userId", "name", "username", "email"]);

		const user = users[0];

		res.status(200).send({ user });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
