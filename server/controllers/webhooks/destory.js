const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const { id } = req.params;

	try {
		await database.delete().from("webhooks").where({ id });

		res.status(204);
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
