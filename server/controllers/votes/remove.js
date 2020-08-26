// database
const database = require("../../database");

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
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
};
