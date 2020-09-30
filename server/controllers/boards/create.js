// modules
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const createHex = require("../../utils/createHex");
const logger = require("../../utils/logger");

exports.create = async (req, res) => {
	const name = req.body.name;

	const boardId = uuidv4(name);

	const url = name
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-");

	try {
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

		res.status(201).send({
			status: {
				code: 201,
				type: "success"
			},
			board
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
