const database = require('../../database');

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
		if (sort === 'latest') {
			sortBy = `
				ORDER BY
					created_at DESC
			`
		}
		if (sort === 'oldest') {
			sortBy = `
				ORDER BY
					created_at ASC
			`
		}
	}

	// todo
	/**
	 * status, category
	 * page number based query
	 */

	database.query(`
		SELECT
			title,
			slug,
			created_at
		FROM
			post
		${sortBy}
	;`).then(posts => {

		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			},
			posts: posts.rows
		})
	}).catch(error => {
		console.error(error);
	});
}
