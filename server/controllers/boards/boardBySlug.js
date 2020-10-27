// services
const getBoardBySlug = require("../../services/boards/getBoardBySlug");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.boardBySlug = async (req, res) => {
	const slug = req.params.slug;

	try {
		const board = await getBoardBySlug(slug);

		if (board) {
			res.status(200).send(board);
		} else {
			res.status(404).send({
				message: error.api.boards.boardNotFound,
				code: "BOARD_NOT_FOUND"
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
