const database = require("../../database");

// services
const getBoardById = require("../../services/boards/getBoardById");
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.postBySlug = async (req, res) => {
	const slug = req.params.slug;

	if (!slug) {
		res.status(400).send({
			message: error.api.posts.slugMissing,
			code: "MISSING_POST_SLUG"
		});
	}

	try {
		const posts = await database
			.select()
			.from("posts")
			.where({
				slug
			})
			.limit(1);

		const post = posts[0];

		if (!post) {
			res.status(404).send({
				message: error.api.posts.postNotFound,
				code: "POST_NOT_FOUND"
			});
			return;
		}

		// get post users
		const users = await database
			.select()
			.from("users")
			.where({
				userId: post.userId
			})
			.limit(1);

		const user = users[0];
		delete user.password;
		delete user.isVerified;
		delete user.isOwner;
		delete user.isModerator;
		delete user.isBlocked;

		// get post boards
		const board = await getBoardById(post.boardId);
		delete post.userId;
		delete post.boardId;

		// get post votes
		const voters = await getVotes(post.postId);

		res.status(200).send({
			post: {
				...post,
				board,
				user
			},
			voters
		});
	} catch (err) {
		logger.error(err);
	}
};
