const database = require("../../database");

exports.filterPost = async (req, res) => {
	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = 10;

	const posts = await database
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
