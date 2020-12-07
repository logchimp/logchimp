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

	const name = req.body.name;

	const checkPermission = permissions.find(item => item === "board:create");
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
		const createBoard = await database
			.insert({
				boardId: uuidv4(),
				name,
				url,
				color: createHex()
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
