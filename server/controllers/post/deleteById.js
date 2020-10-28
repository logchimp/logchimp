// database
const database = require("../../database");

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
