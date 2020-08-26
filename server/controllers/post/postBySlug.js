const database = require("../../database");

exports.postBySlug = async (req, res) => {
	const slug = req.params.slug;

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

	try {
		const post = posts[0];

		if (post) {
			const postId = post.postId;

			const voters = await database
				.select()
				.from("votes")
				.where({ postId });

			try {
				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					post,
					voters
				});
			} catch (error) {
				console.error(error);
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
	} catch (error) {
		console.error(error);
	}
};
