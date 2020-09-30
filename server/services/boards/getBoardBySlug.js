const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const getBoardBySlug = async slug => {
	try {
		const boards = await database
			.select()
			.from("boards")
			.where({
				url: slug
			})
			.limit(1);

		const board = boards[0];
		if (board) {
			return board;
		} else {
			return null;
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = getBoardBySlug;
