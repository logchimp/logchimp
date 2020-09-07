// database
const database = require("../../database");

exports.accessDashboard = (req, res) => {
	const userId = req.params.userId;

	database
		.select("userId", "isOwner", "isModerator", "isBlocked")
		.from("users")
		.where({
			userId
		})
		.limit(1)
		.then(response => {
			const user = response[0];

			if (!user.isBlocked) {
				if (user.isOwner || user.isModerator) {
					res.status(200).send({
						status: {
							code: 200,
							type: "success"
						},
						access: true
					});
				} else {
					res.status(403).send({
						status: {
							code: 403,
							type: "error"
						},
						error: {
							code: "user_unauthorise",
							message: "Not authorise to access dashboard"
						}
					});
				}
			} else {
				res.status(403).send({
					status: {
						code: 403,
						type: "error"
					},
					error: {
						code: "user_blocked",
						message: "User account is blocked"
					}
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
