const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

exports.add = async (req, res) => {
	const userId = req.body.userId;
	const postId = req.body.postId;

	// generate post unique indentification
	const voteId = uuidv4(postId);

	const votes = await database
		.insert({
			voteId,
			userId,
			postId,
			createdAt: new Date().toJSON()
		})
		.into("votes")
		.returning("*");

	try {
		const vote = votes[0];

		if (vote) {
			const voters = await database
				.select()
				.from("votes")
				.where({
					postId
				});

			try {
				res.status(201).send({
					status: {
						code: 201,
						type: "success"
					},
					voters
				});
			} catch (error) {
				console.log(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
};
