// services
const getUser = require("../../services/auth/getUser");
const createUser = require("../../services/auth/createUser");

// utils
const { createToken } = require("../../utils/token");

const error = require("../../errorResponse.json");

exports.signup = async (req, res) => {
	const emailAddress = req.body.emailAddress;

	try {
		const getAuthUser = await getUser(emailAddress);

		if (!getAuthUser) {
			const password = req.body.password;
			const fullName = req.body.fullName || "";
			const isOwner = req.body.isOwner || false;

			// split first & last name
			const name = fullName.split(" ");
			const firstname = name[0];
			name.shift();
			const lastname = name.join(" ");

			try {
				const userData = await createUser({
					emailAddress,
					password,
					firstname,
					lastname,
					isOwner
				});

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
					res.status(404).send({
						message: error.middleware.user.userNotFound,
						code: "USER_NOT_FOUND"
					});
				}
			} catch (err) {
				res.status(500).send({
					message: error.middleware.auth.internalServerError,
					code: "INTERNAL_SERVER_ERROR"
				});
			}
		} else {
			res.status(409).send({
				message: error.middleware.user.userExists,
				code: "USER_EXISTS"
			});
		}
	} catch (error) {
		console.error(error);
	}
};
