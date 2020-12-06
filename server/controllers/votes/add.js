const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.add = async (req, res) => {
	const userId = req.body.userId;
	const postId = req.body.postId;

	try {
		const { rows } = await database.raw(
			`
				SELECT EXISTS (
					SELECT
						*
					FROM
						votes
					WHERE
							"postId" = :postId
						AND
							"userId" = :userId
				);
			`,
			{
				postId,
				userId
			}
		);

		const voteExists = rows[0].exists;

		// Add vote to post
		if (!voteExists) {
			// generate post unique indentification
			const voteId = uuidv4(postId);

			try {
				await database
					.insert({
						voteId,
						userId,
						postId
					})
					.into("votes")
					.returning("*");

				const voters = await getVotes(postId, userId);

				res.status(201).send(voters);
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});
			}
		} else {
			res.status(409).send({
				message: error.api.votes.exists,
				code: "VOTE_EXISTS"
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
