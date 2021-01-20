// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

module.exports = async (req, res) => {
	const permissions = req.user.permissions;

	const id = req.body.id;

	const checkPermission = permissions.includes("board:destroy");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.roles.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	try {
		await database
			.delete()
			.from("boards")
			.where({
				boardId: id
			});

		res.sendStatus(204);
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
