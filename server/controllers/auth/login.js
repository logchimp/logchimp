// modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const database = require("../../database");

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	// find member using email address
	database
		.select(
			"member_id",
			"first_name",
			"last_name",
			"email_address",
			"password",
			"profile_picture",
			"is_owner",
			"is_moderator",
			"is_blocked",
			"created_at"
		)
		.from("member")
		.where({
			email_address: email
		})
		.then(member => {
			const memberData = member[0];

			// validate member password with encrypted password in database
			bcrypt.compare(password, memberData.password).then(validatePassword => {
				if (validatePassword) {
					const loginToken = jwt.sign(
						{
							member_id: memberData.member_id,
							email_address: memberData.email_address,
							is_owner: memberData.is_owner,
							is_moderator: memberData.is_moderator,
							is_blocked: memberData.is_blocked,
							created_at: memberData.created_at
						},
						"secretKey",
						{ expiresIn: "2d" }
					);

					res.status(200).send({
						status: {
							code: 200,
							type: "success"
						},
						member: {
							member_id: memberData.member_id,
							first_name: memberData.first_name,
							last_name: memberData.last_name,
							email_address: memberData.email_address,
							profile_picture: memberData.profile_picture,
							is_owner: memberData.is_owner,
							is_moderator: memberData.is_moderator,
							is_blocked: memberData.is_blocked,
							created_at: memberData.created_at
						},
						token: loginToken
					});
				} else {
					res.status(409).send({
						status: {
							code: 409,
							type: "error"
						},
						error: {
							code: "invalid_password",
							message: "Password is incorrect"
						}
					});
				}
			});
		})
		.catch(error => {
			console.error(error);

			res.status(409).send({
				status: {
					code: 409,
					type: "error"
				},
				error: {
					code: "member_not_found",
					message: "Member not found."
				}
			});
		});
};
