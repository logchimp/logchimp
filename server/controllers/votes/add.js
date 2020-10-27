// services
const create = require("../../services/votes/create");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.add = async (req, res) => {
	const userId = req.body.userId;
	const postId = req.body.postId;

	if (!userId) {
		res.status(400).send({
			message: error.api.user.userIdMissing,
			code: "MISSING_USER_ID"
		});
	}

	if (!postId) {
		res.status(400).send({
			message: error.api.posts.postIdMissing,
			code: "MISSING_POST_ID"
		});
	}

	try {
		const vote = await create(userId, postId);

		res.status(201).send({
			...vote
		});
	} catch (err) {
		logger.error(err);
	}
};
