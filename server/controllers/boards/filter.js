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
		const boards = response;

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
