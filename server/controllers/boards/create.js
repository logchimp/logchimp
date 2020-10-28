// modules
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const createHex = require("../../utils/createHex");
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.create = async (req, res) => {
	const name = req.body.name;

	if (!name) {
		res.status(400).send({
			message: error.api.boards.emptyName,
			code: "MISSING_BOARD_NAME"
		});
		return;
	}

	const boardId = uuidv4(name);

	const url = name
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-");

	try {
		// check for existing board by url
		const getBoardByUrl = await database
			.select()
			.from("boards")
			.where({
				url
			})
			.limit(1);

		if (getBoardByUrl[0]) {
			res.status(409).send({
				message: error.api.boards.exists,
				code: "BOARD_EXISTS"
			});
		}

		const createBoard = await database
			.insert({
				boardId,
				name,
				url,
				color: createHex(),
				createdAt: new Date().toJSON(),
				updatedAt: new Date().toJSON()
			})
			.into("boards")
			.returning("*");

		const board = createBoard[0];

		res.status(201).send(board);
	} catch (err) {
		logger.error(err);
	}
};
