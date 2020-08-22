const database = require("../../database");

exports.updateUser = (req, res, next) => {
	const userId = req.body.userId;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;

	database
		.update({
			first_name: firstName,
			last_name: lastName
		})
		.from("member")
		.where({
			member_id: userId
		})
		.returning("*")
		.then(response => {
			console.log(response);
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
						message: "User not found."
					}
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
