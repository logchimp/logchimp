const database = require("../../database");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

exports.deleteById = async (req, res) => {
	const permissions = req.user.permissions;

	const id = req.body.id;

	const checkPermission = permissions.find(item => item === "post:destroy");
	if (!checkPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	try {
		await database
			.delete()
			.from("posts")
			.where({
				postId: id
			});

		res.sendStatus(204);
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
