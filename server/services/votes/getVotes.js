const database = require("../../database");

const getVotes = async postId => {
	const voters = await database
		.select()
		.from("votes")
		.where({
			postId
		});

	try {
		return voters;
	} catch (error) {
		console.error(error);
	}
};

module.exports = getVotes;
