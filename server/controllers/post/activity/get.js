const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");

module.exports = async (req, res) => {
	const { post_id } = req.params;
	const { sort = 'desc' } = req.query;

	try {
		const activity = await database
			.select()
			.from("posts_comments")
			.where({
				post_id
			})
			.orderBy("created_at", sort);

		for (let i = 0; i < activity.length; i++) {
			const item = activity[i];

			const user = await database
				.select("userId", "name", "username", "avatar")
				.from("users")
				.where({
					userId: item.author_id
				})
				.first();

			delete item.author_id;
			item.author = user;
		}

		res.status(200).send({
			activity
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
