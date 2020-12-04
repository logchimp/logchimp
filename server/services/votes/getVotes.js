const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getVotes = async (postId, userId) => {
	try {
		const { rows: votesCount } = await database.raw(
			`
				SELECT
					COUNT("voteId")::INTEGER
				FROM
					votes
				WHERE
					"postId" = :postId;
			`,
			{
				postId
			}
		);

		const votes = await database
			.select()
			.from("votes")
			.where({
				postId
			})
			.limit(10);

		const viewerVote = votes.find(item => {
			return item.userId === userId;
		});

		return {
			votes,
			votesCount: votesCount[0].count,
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
