const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const { id } = req.params;

	try {
		const webhooks = await database
			.select()
			.from("webhooks")
			.where({ id })
			.first();

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
