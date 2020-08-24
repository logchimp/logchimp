// modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// database
const database = require("../../database");

exports.login = (req, res) => {
	const emailAddress = req.body.emailAddress;
	const password = req.body.password;

	// find user using email address
	database
		.select()
		.from("users")
		.where({
			emailAddress
		})
		.limit(1)
		.then(response => {
			const user = response[0];

			if (user) {
				// validate user password with hash password in database
				bcrypt
					.compare(password, user.password)
					.then(validatePassword => {
						if (validatePassword) {
							// generate authToken
							const authToken = jwt.sign(user, "secretKey", {
								expiresIn: "2d"
							});

							// send user data with authToken as response
							res.status(200).send({
								status: {
									code: 200,
									type: "success"
								},
								user: {
									...user,
									authToken
								}
							});
						} else {
							// incorrect password response
							res.status(403).send({
								status: {
									code: 403,
									type: "error"
								},
								error: {
									code: "invalid_password",
									message: "Password is incorrect"
								}
							});
						}
					})
					.catch(error => {
						console.error(error);
					});
			} else {
				// user not found response
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
