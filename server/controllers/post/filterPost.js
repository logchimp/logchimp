const database = require("../../database");

// services
const getBoardById = require("../../services/boards/getBoardById");
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

exports.filterPost = async (req, res) => {
	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	const response = await database
		.select(
			"postId",
			"title",
			"slug",
			"boardId",
			"contentMarkdown",
			"createdAt"
		)
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
			const boardId = response[i].boardId;

			const board = await getBoardById(boardId);
			const voters = await getVotes(postId);

			try {
				posts.push({
					...response[i],
					board,
					voters
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
			posts
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
