// modules
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const createHex = require("../../utils/createHex");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.create = async (req, res) => {
	const permissions = req.user.permissions;

	const { name, url, color, view_voters } = req.body;

	const checkPermission = permissions.find(item => item === "board:create");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	if (!name) {
		return res.status(400).send({
			errors: [
				!name
					? {
							message: error.api.boards.nameMissing,
							code: "BOARD_NAME_MISSING"
					  }
					: ""
			]
		});
	}

	const slimUrl = (url || name)
		.replace(/[^\w]+/gi, "-")
		.trim()
		.toLowerCase();

	const board = await database
		.select()
		.from("boards")
		.where({
			url
		})
		.first();

	if (board) {
		return res.status(409).send({
			message: error.api.boards.exists,
			code: "BOARD_EXISTS"
		});
	}

	try {
		const createBoard = await database
			.insert({
				boardId: uuidv4(),
				name,
				url: slimUrl,
				color: color || createHex(),
				view_voters
			})
			.into("boards")
			.returning("*");

		const board = createBoard[0];

		res.status(201).send({ board });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
