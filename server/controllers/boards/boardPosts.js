const database = require("../../database");

// services
const getBoardBySlug = require("../../services/boards/getBoardBySlug");
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.boardPosts = async (req, res) => {
	const slug = req.params.slug;

	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;

	try {
		const board = await getBoardBySlug(slug);

		if (board) {
			try {
				const posts = await database
					.select("postId", "title", "slug", "contentMarkdown", "createdAt")
					.from("posts")
					.where({
						boardId: board.boardId
					})
					.limit(limit)
					.offset(limit * page)
					.orderBy([
						{
							column: "createdAt",
							order: created
						}
					]);

				const postVoters = [];

				for (let i = 0; i < posts.length; i++) {
					const postId = posts[i].postId;

					try {
						const voters = await getVotes(postId);

						postVoters.push({
							...posts[i],
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
					posts: postVoters
				});
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});
			}
		} else {
			logger.log({
				level: "error",
				code: "BOARD_NOT_FOUND",
				message: `'${slug}' board not found`
			});

			res.status(404).send({
				code: "BOARD_NOT_FOUND",
				message: error.api.boards.boardNotFound
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
