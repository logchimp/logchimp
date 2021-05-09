const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	const { id } = req.params;
	const { name, event, target_url, description } = req.body;

	try {
		const webhook = await database
			.update({
				name,
				event,
				target_url,
				description,
				updated_at: new Date().toJSON()
			})
			.from("webhooks")
			.where({ id })
			.returning("*");

		res.status(200).send({
			webhook: webhook[0]
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
