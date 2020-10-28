// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.remove = async (req, res) => {
	const voteId = req.body.voteId;
	const postId = req.body.postId;

	if (!voteId) {
		res.status(400).send({
			message: error.api.votes.voteIdMissing,
			code: "MISSING_VOTE_ID"
		});
		return;
	}

	if (!postId) {
		res.status(400).send({
			message: error.api.posts.postIdMissing,
			code: "MISSING_POST_ID"
		});
		return;
	}

	try {
		const getExistingVote = await database
			.select()
			.from("votes")
			.where({
				voteId
			});

		const existingVote = getExistingVote[0];

		if (!existingVote) {
			res.status(404).send({
				message: error.api.votes.notExists,
				code: "VOTE_NOT_EXISTS"
			});
			return;
		}

		await database
			.del()
			.from("votes")
			.where({ voteId });

		const voters = await database
			.select()
			.from("votes")
			.where({ postId });

		res.status(200).send(voters);
	} catch (err) {
		logger.error(err);
	}
};
