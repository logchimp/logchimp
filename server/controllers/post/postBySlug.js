const database = require("../../database");

exports.postBySlug = (req, res) => {
	const slug = req.params.slug;

	database
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
		.limit(1)
		.then(response => {
			const post = response[0];

			if (post) {
				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					post
				});
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
		})
		.catch(error => {
			console.log(error);
		});
};
