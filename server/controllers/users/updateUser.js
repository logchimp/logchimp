// database
const database = require("../../database");

exports.updateUser = (req, res) => {
	const userId = req.body.userId;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;

	database
		.update({
			firstname,
			lastname
		})
		.from("users")
		.where({
			userId
		})
		.returning("*")
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
