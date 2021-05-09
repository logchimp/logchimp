// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

exports.update = async (req, res) => {
	const {
		title,
		description,
		allowSignup,
		accentColor,
		googleAnalyticsId
	} = req.body;

	try {
		const updateSettings = await database
			.update({
				title,
				description,
				allowSignup,
				accentColor,
				googleAnalyticsId
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
