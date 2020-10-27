const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

/**
 * Add vote to a post
 *
 * @param {string} userId
 * @param {string} postId
 */
const create = async (userId, postId) => {
	try {
		const getExistingVote = await database
			.select()
			.from("votes")
			.where({
				userId,
				postId
			});

		const existingVote = getExistingVote[0];

		if (existingVote) {
			return {
				message: error.api.votes.exists,
				code: "VOTE_EXISTS"
			};
		}

		// generate post unique indentification
		const voteId = uuidv4(postId);

		const addVoteToPost = await database
			.insert({
				voteId,
				userId,
				postId,
				createdAt: new Date().toJSON()
			})
			.into("votes")
			.returning("*");

		const vote = addVoteToPost[0];
		return vote;
	} catch (err) {
		logger.error(err);
	}
};

module.exports = create;
