const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	try {
		const webhooks = await database
			.select()
			.from("webhooks")
			.orderBy("created_at", "asc");

		res.status(200).send({
			webhooks
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
