// services
const getUser = require("../../services/auth/getUser");
const createUser = require("../../services/auth/createUser");

// utils
const { createToken } = require("../../utils/token");

exports.signup = async (req, res) => {
	const emailAddress = req.body.emailAddress;
	const getAuthUser = await getUser(emailAddress);

	try {
		if (!getAuthUser) {
			const password = req.body.password;
			const fullName = req.body.fullName || "";
			const isOwner = req.body.isOwner || false;

			// split first & last name
			const name = fullName.split(" ");
			const firstname = name[0];
			name.shift();
			const lastname = name.join(" ");

			const userData = await createUser({
				emailAddress,
				password,
				firstname,
				lastname,
				isOwner
			});

			try {
				if (userData) {
					/**
					 * authToken sent via email will expire after 3 hr
					 */
					// todo: send email for account verification

					// generate authToken
					const authToken = createToken(userData, process.env.SECRET_KEY, {
						expiresIn: "2d"
					});

					// send user data with authToken as response
					res.status(201).send({
						status: {
							code: 201,
							type: "success"
						},
						user: {
							...userData,
							authToken
						}
					});
				} else {
					res.status(500).send({
						status: {
							code: 500,
							type: "error"
						},
						error: {
							code: "account_not_created",
							message: "Account not created"
						}
					});
				}
			} catch (error) {
				console.error(error);
			}
		} else {
			res.status(409).send({
				status: {
					code: 409,
					type: "error"
				},
				error: {
					code: "email_already_taken",
					message: "Email address already taken"
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
};
