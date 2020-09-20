const database = require("../../database");

const getBoardById = async boardId => {
	const boards = await database
		.select()
		.from("boards")
		.where({
			boardId
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

module.exports = getBoardById;
