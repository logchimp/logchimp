// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const { userId } = req.user;

	try {
		const user = await database
			.select("userId", "name", "username", "email", "isVerified")
			.from("users")
			.where({
				userId
			})
			.first();

		res.status(200).send({
			user
		});
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
