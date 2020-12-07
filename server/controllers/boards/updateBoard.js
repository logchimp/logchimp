const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const permissions = req.user.permissions;
	const boardId = req.board.boardId;

	const name = req.body.name;
	const color = req.body.color;

	const checkPermission = permissions.find(item => item === "board:update");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	const url = name
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-");

	try {
		const boards = await database
			.update({
				name,
				url,
				color,
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
