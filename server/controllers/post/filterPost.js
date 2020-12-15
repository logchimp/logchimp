const database = require("../../database");

// services
const getBoardById = require("../../services/boards/getBoardById");
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

exports.filterPost = async (req, res) => {
	const userId = req.body.userId;
	const boardId = req.body.boardId;
	/**
	 * top, latest, oldest, trending
	 */
	const created = req.body.created;
	const page = req.body.page - 1;
	const limit = req.body.limit || 10;

	try {
		const { rows: response } = await database.raw(
			`
				SELECT
					"postId",
					"title",
					"slug",
					"boardId",
					"contentMarkdown",
					"createdAt"
				FROM
					posts
				${
					boardId
						? `WHERE "boardId" IN (${boardId.map(item => {
								return `'${item}'`;
						  })})`
						: ""
				}
				ORDER BY "createdAt" ${created}
				LIMIT :limit
				OFFSET :offset;
		`,
			{
				limit,
				offset: limit * page
			}
		);

		const posts = [];

		for (let i = 0; i < response.length; i++) {
			const postId = response[i].postId;
			const boardId = response[i].boardId;

			try {
				const board = await getBoardById(boardId);
				const voters = await getVotes(postId, userId);

				delete response[i].boardId;

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

		res.status(200).send({ posts });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
