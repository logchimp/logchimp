// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.siteSettings = async (_, res) => {
	try {
		const settings = await database
			.select(["*", database.raw("labs::json")])
			.from("settings")
			.first();

		res.status(200).send({
			settings
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
