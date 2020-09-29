const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.postBySlug = async (req, res) => {
	const slug = req.params.slug;

	try {
		const posts = await database
			.select(
				"users.userId",
				"users.firstname",
				"users.lastname",
				"users.username",
				"users.avatar",
				"posts.*"
			)
			.from("posts")
			.innerJoin("users", "posts.userId", "users.userId")
			.where({
				slug
			})
			.limit(1);

		const post = posts[0];

		if (post) {
			const postId = post.postId;

			try {
				const voters = await database
					.select()
					.from("votes")
					.where({ postId });

				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					post,
					voters
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
