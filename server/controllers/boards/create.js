// modules
const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const createHex = require("../../utils/createHex");

exports.create = async (req, res) => {
	const name = req.body.name;

	const boardId = uuidv4(name);

	const url = name
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-");

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

	try {
		const board = createBoard[0];

		if (board) {
			res.status(201).send({
				status: {
					code: 201,
					type: "success"
				},
				board
			});
		} else {
			res.status(500).send({
				status: {
					code: 500,
					type: "error"
				},
				error: {
					code: "board_not_created",
					message: "Unable to create board"
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
};
