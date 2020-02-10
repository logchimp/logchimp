const database = require("../../database");

exports.getPostById = (req, res, next) => {
	const postId = req.params.postId;
	console.log("postId");
	console.log(postId);
	database
		.select()
		.from("post")
		.where({
			slug: postId
		})
		.then(post => {
			const postData = post[0];

			if (postData) {
				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					post: postData
				});
			} else {
				res.status(404).send({
					status: {
						code: 404,
						type: "error"
					},
					error: {
						code: "post_not_found",
						message: "Post not found."
					}
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
