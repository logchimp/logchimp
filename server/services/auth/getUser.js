// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getUser = async email => {
	try {
		const users = await database
			.select()
			.from("users")
			.where({
				email
			})
			.limit(1);

		const user = users[0];
		if (user) {
			delete user.createdAt;
			delete user.updatedAt;

			return user;
		}
		return null;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getUser;
