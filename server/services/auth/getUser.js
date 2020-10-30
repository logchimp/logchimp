// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getUser = async emailAddress => {
	try {
		const users = await database
			.select()
			.from("users")
			.where({
				emailAddress
			})
			.limit(1);

		const user = users[0];

		if (!user) {
			return null;
		}

		return user;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getUser;
