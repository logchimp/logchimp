const database = require("../../database");

exports.filterPost = (req, res, next) => {
	/**
	 * latest, oldest, top, trending
	 */
	const sort = req.query.sort;
	// status and category can include multiple IDs as query parameter
	const statusId = req.query.status;
	const categoryId = req.query.category;

	const statusArray = Array.isArray(statusId);
	const categoryArray = Array.isArray(categoryId);

	let sortBy = "";
	if (sort) {
		if (sort === "latest") {
			sortBy = "DESC";
		}
		if (sort === "oldest") {
			sortBy = "ASC";
		}
	}

	// todo
	/**
	 * status, category
	 * page number based query
	 */

	database
		.select("post_id", "title", "slug", "body_markdown", "created_at")
		.from("post")
		.orderBy([
			{
				column: "created_at",
				order: sortBy
			}
		])
		.then(posts => {
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				posts
			});
		})
		.catch(error => {
			console.error(error);
		});
};
