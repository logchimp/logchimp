const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.filter = async (req, res) => {
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	try {
		const response = await database
			.select()
			.from("boards")
			.limit(limit)
			.offset(limit * page)
			.orderBy([
				{
					column: "createdAt",
					order: created
				}
			]);

		const boards = [];

		for (let i = 0; i < response.length; i++) {
			const boardId = response[i].boardId;

			try {
				const postCount = await database
					.count()
					.from("posts")
					.where({
						boardId
					});

				boards.push({
					...response[i],
					posts: postCount[0].count
				});
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});
			}
		}

		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			},
			boards
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
