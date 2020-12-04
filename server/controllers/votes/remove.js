// database
const database = require("../../database");

// services
const getVotes = require("../../services/votes/getVotes");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.remove = async (req, res) => {
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

		if (voteExists) {
			try {
				await database
					.delete()
					.from("votes")
					.where({
						postId,
						userId
					});

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
				message: error.api.votes.voteNotFound,
				code: "VOTE_NOT_FOUND"
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
