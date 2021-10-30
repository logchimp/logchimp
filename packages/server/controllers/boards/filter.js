const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.filter = async (req, res) => {
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	try {
		const boards = await database
			.select("boards.boardId", "boards.name", "boards.color", "boards.url")
			.count("posts", { as: "post_count" })
			.from("boards")
			.leftJoin("posts", "boards.boardId", "posts.boardId")
			.where({
				display: true
			})
			.groupBy("boards.boardId")
			.orderBy("boards.createdAt", created)
			.limit(limit)
			.offset(limit * page);

		res.status(200).send({ boards });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
