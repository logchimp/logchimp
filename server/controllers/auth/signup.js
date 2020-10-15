// services
const getUser = require("../../services/auth/getUser");
const createUser = require("../../services/auth/createUser");

// utils
const { createToken } = require("../../utils/token");
const logger = require("../../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

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
					const secretKey = config.server.secretKey;
					const authToken = createToken(userData, secretKey, {
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
				logger.log({
					level: "error",
					code: "INTERNAL_SERVER_ERROR",
					message: err
				});

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
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
