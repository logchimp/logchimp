const { v4: uuid } = require("uuid");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	try {
		const webhook = await database
			.insert({
				id: uuid(),
				name: "New webhook",
				created_at: new Date().toJSON(),
				updated_at: new Date().toJSON()
			})
			.into("webhooks")
			.returning("*");

		res.status(201).send({
			webhook: webhook[0]
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
