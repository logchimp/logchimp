const error = require("../errorResponse.json");

const validateUserAccess = (req, res, next) => {
	const authUser = res.locals.user;
	const user = req.body;

	if (authUser.userId === user.userId) {
		next();
	} else if (authUser.isOwner || authUser.isModerator) {
		next();
	} else {
		return res.status(401).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}
};

module.exports = validateUserAccess;
