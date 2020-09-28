const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.add = async (req, res) => {
	const userId = req.body.userId;
	const postId = req.body.postId;

	// generate post unique indentification
	const voteId = uuidv4(postId);

	try {
		const votes = await database
			.insert({
				voteId,
				userId,
				postId,
				createdAt: new Date().toJSON()
			})
			.into("votes")
			.returning("*");

		const vote = votes[0];

		if (vote) {
			try {
				const voters = await database
					.select()
					.from("votes")
					.where({
						postId
					});

				res.status(201).send({
					status: {
						code: 201,
						type: "success"
					},
					voters
				});
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});
			}
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
