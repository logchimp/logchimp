const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getVotes = async postId => {
	const voters = await database
		.select()
		.from("votes")
		.where({
			postId
		});

	try {
		return voters;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getVotes;
