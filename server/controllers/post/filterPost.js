const database = require("../../database");

exports.filterPost = (req, res) => {
	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;

	database
		.select("postId", "title", "slug", "contentMarkdown", "createdAt")
		.from("posts")
		.orderBy([
			{
				column: "createdAt",
				order: created
			}
		])
		.then(response => {
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				posts: response
			});
		})
		.catch(error => {
			console.error(error);
		});
};
