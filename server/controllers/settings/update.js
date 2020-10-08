// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.update = async (req, res) => {
	const title = req.body.title;
	const description = req.body.description;
	const accentColor = req.body.accentColor;

	try {
		const updateSettings = await database
			.update({
				title,
				description,
				accentColor
			})
			.from("settings")
			.returning("*");

		const settings = updateSettings[0];

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
