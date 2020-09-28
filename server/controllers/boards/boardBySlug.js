// services
const getBoardBySlug = require("../../services/boards/getBoardBySlug");

// utils
const logger = require("../../utils/logger");

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
			res.status(404).send({
				status: {
					code: 404,
					type: "error"
				},
				error: {
					code: "board_not_found",
					message: "Board not found"
				}
			});
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
