const database = require("../../database");

exports.filterPost = async (req, res) => {
	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	const response = await database
		.select("postId", "title", "slug", "contentMarkdown", "createdAt")
		.from("posts")
		.limit(limit)
		.offset(limit * page)
		.orderBy([
			{
				column: "createdAt",
				order: created
			}
		]);

	try {
		const posts = [];

		for (let i = 0; i < response.length; i++) {
			const postId = response[i].postId;

			const voters = await database
				.select()
				.from("votes")
				.where({
					postId
				});

			try {
				posts.push({
					...response[i],
					voters
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
			posts
		});
	} catch (error) {
		console.error(error);
	}
};
