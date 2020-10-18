// services
const getUser = require("../../services/auth/getUser");
const createUser = require("../../services/auth/createUser");

// services
const mail = require("../../services/mail");

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
					// secretKey
					const secretKey = config.server.secretKey;
					const host = req.headers.host;
					try {
						/**
						 * authToken sent via email will expire after 1 hr
						 */
						const onboardingMailContent = await mail.generateContent("verify", {
							siteUrl: host
						});

						const emailVerification = new mail.Mail();
						const noReplyEmail = `noreply@${host}`;

						await emailVerification.send({
							from: noReplyEmail,
							to: emailAddress,
							subject: "LogChimp - Please confirm your email",
							text: onboardingMailContent.text,
							html: onboardingMailContent.html
						});

						// generate authToken
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
					} catch (error) {
						console.error(error);
					}
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
