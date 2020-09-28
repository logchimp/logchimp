const database = require("../../database");

// utils
const logger = require("../../utils/logger");

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
				status: {
					code: 404,
					type: "error"
				},
				error: {
					code: "post_not_found",
					message: "Post not found"
				}
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
