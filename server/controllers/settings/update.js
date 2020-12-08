// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const permissions = req.user.permissions;

	const title = req.body.title;
	const description = req.body.description;
	const accentColor = req.body.accentColor;
	const googleAnalyticsId = req.body.googleAnalyticsId;

	const checkPermission = permissions.find(item => item === "setting:update");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	try {
		const updateSettings = await database
			.update({
				title,
				description,
				accentColor,
				googleAnalyticsId
			})
			.from("settings")
			.returning("*");

		const settings = updateSettings[0];

		res.status(200).send({ settings });
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
