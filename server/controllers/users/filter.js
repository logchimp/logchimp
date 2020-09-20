// database
const database = require("../../database");

// services
const getUsers = require("../../services/users/getUsers");

exports.filter = async (req, res) => {
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	const userData = await getUsers(created, limit, page);

	try {
		const users = [];

		for (let i = 0; i < userData.length; i++) {
			const userId = userData[i].userId;

			const postsCount = await database
				.count()
				.from("posts")
				.where({ userId });
			const votesCount = await database
				.count()
				.from("votes")
				.where({ userId });

			try {
				users.push({
					votes: votesCount[0].count,
					posts: postsCount[0].count,
					...userData[i]
				});
			} catch (error) {
				console.log(error);
			}
		}

		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			},
			users
		});
	} catch (error) {
		console.log(error);
	}
};
