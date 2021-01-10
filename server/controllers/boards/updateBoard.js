const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const permissions = req.user.permissions;
	const boardId = req.board.boardId;

	const { name, url, color, view_voters } = req.body;

	const checkPermission = permissions.find(item => item === "board:update");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	if (!url) {
		return res.status(400).send({
			errors: [
				!url
					? {
							message: error.api.boards.urlMissing,
							code: "BOARD_URL_MISSING"
					  }
					: ""
			]
		});
	}

	const slimUrl = url
		.replace(/[^\w]+/gi, "-")
		.trim()
		.toLowerCase();

	try {
		const boards = await database
			.update({
				name,
				url: slimUrl,
				color,
				view_voters,
				updatedAt: new Date().toJSON()
			})
			.from("boards")
			.where({
				boardId
			})
			.returning("*");

		const board = boards[0];

		res.status(200).send({ board });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
