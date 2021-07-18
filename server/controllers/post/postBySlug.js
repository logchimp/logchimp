const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const { validUUID } = require("../../helpers");
const logger = require("../../utils/logger");

exports.postBySlug = async (req, res) => {
	const userId = validUUID(req.body.userId);
	const post = req.post;

	try {
		const author = await database
			.select("userId", "name", "username", "avatar")
			.from("users")
			.where({
				userId: post.userId
			})
			.first();

		const voters = await getVotes(post.postId, userId);

		const board = await database
			.select("boardId", "name", "url", "color")
			.from("boards")
			.where({
				boardId: post.boardId
			})
			.first();

		const roadmap = await database
			.select("id", "name", "url", "color")
			.from("roadmaps")
			.where({
				id: post.roadmap_id
			})
			.first();

		delete post.boardId;
		delete post.userId;
		delete post.roadmap_id;

		res.status(200).send({
			post: {
				board,
				author,
				roadmap,
				...post,
				voters
			}
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
