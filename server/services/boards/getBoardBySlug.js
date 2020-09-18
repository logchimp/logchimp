const database = require("../../database");

const getBoardBySlug = async slug => {
	const boards = await database
		.select()
		.from("boards")
		.where({
			url: slug
		})
		.limit(1);

	try {
		const board = boards[0];
		if (board) {
			return board;
		} else {
			return null;
		}
	} catch (error) {
		console.error(error);
	}
};

module.exports = getBoardBySlug;
