// database
const database = require("../../database");

// services
const getBoardBySlug = require("../../services/boards/getBoardBySlug");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.deleteBoard = async (req, res) => {
	const slug = req.params.slug;

	try {
		const board = await getBoardBySlug(slug);

		if (!board) {
			res.status(404).send({
				message: error.api.boards.boardNotFound,
				code: "BOARD_NOT_FOUND"
			});
			return;
		}

		await database
			.delete()
			.from("boards")
			.where({
				url: slug
			});

		res.sendStatus(204);
	} catch (err) {
		logger.error(err);
	}
};
