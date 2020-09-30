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
			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				board
			});
		} else {
			logger.log({
				level: "error",
				code: "BOARD_NOT_FOUND",
				message: `'${slug}' board not found`
			});

			res.status(404).send({
				code: "BOARD_NOT_FOUND",
				message: error.api.boards.boardNotFound
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
