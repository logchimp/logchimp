const { v4: uuid } = require("uuid");

const database = require("../../../database");

// utils
const logger = require("../../../utils/logger");

module.exports = async (req, res) => {
	const { comment_id } = req.params;

	try {
		await database.delete().from("posts_comments").where({ id: comment_id });

		res.status(204);
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
