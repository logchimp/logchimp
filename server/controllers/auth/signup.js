// modules
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// database
const database = require("../../database");

const signupSchema = Joi.object({
	email: Joi.string()
		.email()
		.min(4)
		.max(50)
		.required(),
	password: Joi.string()
		.min(6)
		.max(72)
		.required()
});

exports.signup = (req, res) => {
	const emailAddress = req.body.emailAddress;
	const password = req.body.password;
	const fullName = req.body.fullName || "";
	const isOwner = req.body.isOwner || false;

	// split first & last name
	const name = fullName.split(" ");
	const firstname = name[0];
	name.shift();
	const lastname = name.join(" ");

	// validate user existance in database
	database
		.select("emailAddress")
		.from("users")
		.where({
			emailAddress
		})
		.limit(1)
		.then(response => {
			const findUser = response[0];

			if (findUser) {
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
			} else {
				// password hashing
				const bcryptSaltRounds = 10;
				const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);
				const hashPassword = bcrypt.hashSync(password, bcryptSalt);

				// generate user unique indentification
				const userId = uuidv4(emailAddress);

				// get username from email address
				const username = emailAddress.split("@")[0];

				// save user to database
				database
					.insert({
						userId,
						emailAddress,
						username,
						password: hashPassword,
						firstname,
						lastname,
						isOwner,
						createdAt: new Date().toJSON(),
						updatedAt: new Date().toJSON()
					})
					.into("users")
					.returning("*")
					.then(response => {
						const user = response[0];

						/**
						 * authToken sent via email will expire after 3 hr
						 */
						const emailValidationAuthToken = jwt.sign(
							user,
							process.env.SECRET_KEY,
							{
								expiresIn: "3h"
							}
						);
						// todo: send email for account verification

						// generate authToken
						const authToken = jwt.sign(user, process.env.SECRET_KEY, {
							expiresIn: "2d"
						});

						// send user data with authToken as response
						res.status(201).send({
							status: {
								code: 201,
								type: "success"
							},
							user: {
								...user,
								authToken
							}
						});
					})
					.catch(error => {
						console.error(error);
					});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
