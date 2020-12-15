const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getVotes = async (postId, userId) => {
	try {
		const votesCount = await database
			.count("voteId")
			.from("votes")
			.where({
				postId
			})
			.first();

		const votes = await database
			.select()
			.from("votes")
			.where({
				postId
			})
			.limit(10);

		const viewerVote = await database
			.select()
			.from("votes")
			.where({
				postId,
				userId: userId || null
			})
			.first();

		return {
			votes,
			votesCount: parseInt(votesCount.count),
			viewerVote: !!viewerVote
		};
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getVotes;
