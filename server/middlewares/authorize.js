const error = require("../errorResponse.json");

const authorize = (req, res, next) => {
	const hasUser = req.user && req.user.userId;

	if (hasUser) {
		const hasRoles = req.user.roles;

		if (hasRoles) {
			const roles = req.user.roles[0];

			// user is blocked
			if (roles.name === "block") {
				return res.status(403).send({
					message: error.middleware.user.userBlocked,
					code: "USER_BLOCKED"
				});
			}

			// user is spam
			if (roles.name === "spam") {
				return res.status(403).send({
					message: error.middleware.user.userSpam,
					code: "USER_SPAM"
				});
			}

			return next();
		} else {
			// In case user doesn't have any roles
			return res.status(403).send({
				message: error.middleware.auth.accessDenied,
				code: "ACCESS_DENIED"
			});
		}
	} else {
		return res.status(401).send({
			message: error.middleware.auth.authorizationFailed,
			code: "AUTHORIZATION_FAILED"
		});
	}
};

module.exports = authorize;
