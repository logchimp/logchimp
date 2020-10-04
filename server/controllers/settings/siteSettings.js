// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.siteSettings = async (req, res) => {
	try {
		const settings = await database.select().from("settings");

		res.status(200).send({
			settings: settings[0]
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
