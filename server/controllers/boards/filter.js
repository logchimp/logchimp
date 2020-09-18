const database = require("../../database");

exports.filter = async (req, res) => {
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

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

	try {
		const boards = [];

		for (let i = 0; i < response.length; i++) {
			const boardId = response[i].boardId;

			const postCount = await database
				.count()
				.from("posts")
				.where({
					boardId
				});

			try {
				boards.push({
					...response[i],
					posts: postCount[0].count
				});
			} catch (error) {
				console.error(error);
			}
		}

		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			},
			boards
		});
	} catch (error) {
		console.error(error);
	}
};
