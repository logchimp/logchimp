// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.remove = async (req, res) => {
	const voteId = req.body.voteId;
	const postId = req.body.postId;

	try {
		const response = await database
			.del()
			.from("votes")
			.where({ voteId });

		if (response) {
			try {
				const voters = await database
					.select()
					.from("votes")
					.where({ postId });

				res.status(200).send({
					status: {
						code: 200,
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
