// utils
const error = require("../../errorResponse.json");

exports.accessDashboard = (req, res) => {
	const permissions = req.user.permissions;

	const accessDashboardPermission = permissions.find(
		item => item === "dashboard:read"
	);
	if (!accessDashboardPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	res.status(200).send({
		access: true
	});
};
