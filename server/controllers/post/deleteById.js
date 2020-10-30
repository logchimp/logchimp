// database
const database = require("../../database");

// services
const getPostById = require("../../services/posts/getPostById");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.deleteById = async (req, res) => {
	const postId = req.params.postId;

	if (!postId) {
		res.status(400).send({
			message: error.api.posts.postIdMissing,
			code: "MISSING_POST_ID"
		});
		return;
	}

	try {
		const getPost = await getPostById(postId);

		if (!getPost) {
			res.status(404).send({
				message: error.api.posts.postNotFound,
				code: "POST_NOT_FOUND"
			});
			return;
		}

		await database
			.delete()
			.from("posts")
			.where({
				postId
			});

		res.sendStatus(204);
	} catch (err) {
		logger.error(err);
	}
};
