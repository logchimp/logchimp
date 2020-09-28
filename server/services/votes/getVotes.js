const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getVotes = async postId => {
	try {
		const voters = await database
			.select()
			.from("votes")
			.where({
				postId
			});

		return voters;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getVotes;
