// database
const database = require("../../database");

const getUsers = async (created, limit, page) => {
	const users = await database
		.select(
			"userId",
			"firstname",
			"lastname",
			"username",
			"avatar",
			"isVerified",
			"isOwner",
			"isModerator",
			"isBlocked"
		)
		.from("users")
		.limit(limit)
		.offset(limit * page)
		.orderBy([
			{
				column: "createdAt",
				order: created
			}
		]);

	try {
		return users;
	} catch (error) {
		console.log(error);
	}
};

module.exports = getUsers;
