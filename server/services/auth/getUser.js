// database
const database = require("../../database");

const getUser = async emailAddress => {
	const users = await database
		.select()
		.from("users")
		.where({
			emailAddress
		})
		.limit(1);

	try {
		const user = users[0];
		if (user) {
			delete user.createdAt;
			delete user.updatedAt;

			return user;
		}
		return null;
	} catch (error) {
		console.error(error);
	}
};

module.exports = getUser;
