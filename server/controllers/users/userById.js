// database
const database = require("../../database");

exports.userById = (req, res) => {
	const userId = req.params.userId;

	database
		.select()
		.from("users")
		.where({
			userId
		})
		.limit(1)
		.then(response => {
			const user = response[0];

			if (user) {
				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					user
				});
			} else {
				res.status(404).send({
					status: {
						code: 404,
						type: "error"
					},
					error: {
						code: "user_not_found",
						message: "User not found"
					}
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
