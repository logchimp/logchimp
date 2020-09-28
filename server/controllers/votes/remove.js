// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.remove = async (req, res) => {
	const voteId = req.body.voteId;
	const postId = req.body.postId;

	const response = await database
		.del()
		.from("votes")
		.where({ voteId });

	try {
		if (response) {
			const voters = await database
				.select()
				.from("votes")
				.where({ postId });

			try {
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
