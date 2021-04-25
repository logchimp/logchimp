const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const { name } = req.params;

	try {
		let boards
		if(name == "" | !name | name == null) {
			boards = await database
				.select("boardId", "name", "url", "color")
				.from("boards").whereNotNull('boardId')
		} else {
			boards = await database
				.select("boardId", "name", "url", "color")
				.from("boards")
				.where("name", "ILIKE", `${name}%`);
		}

		res.status(200).send({
			boards
		});
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
