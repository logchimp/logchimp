const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.postBySlug = async (req, res) => {
	const slug = req.params.slug;

	try {
		const posts = await database
			.select()
			.from("posts")
			.where({
				slug
			});

		const post = posts[0];

		if (post) {
			try {
				const authors = await database
					.select("userId", "name", "username", "avatar")
					.from("users")
					.where({
						userId: post.userId
					});

				const author = authors[0];

				const voters = await getVotes(post.postId, post.userId);

				res.status(200).send({
					post: {
						author,
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
		} else {
			res.status(404).send({
				message: error.api.posts.postNotFound,
				code: "POST_NOT_FOUND"
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
