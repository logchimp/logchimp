const database = require("../../database");

// utils
const error = require("../../errorResponse.json");

module.exports = async (req, res, next) => {
	const id = req.body.id;
	const slug = req.params.slug;

	const post = await database
		.select()
		.from("posts")
		.where({
			postId: id || ""
		})
		.orWhere({
			slug: slug || ""
		})
		.first();

	if (!post) {
		return res.status(404).send({
			message: error.api.posts.postNotFound,
			code: "POST_NOT_FOUND"
		});
	}

	req.post = post;
	next();
};
