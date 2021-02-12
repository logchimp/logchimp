// database
const database = require("../../database");

// services
const createUser = require("../../services/auth/createUser");

// utils
const error = require("../../errorResponse");

module.exports = async (req, res, next) => {
	const { siteTitle, name, email, password } = req.body;

	const isSetup = await database
		.select()
		.from("users")
		.where({
			isOwner: true
		})
		.first();

	if (isSetup) {
		return res.status(403).send({
			message: error.api.authentication.setupAlreadyCompleted,
			code: "SETUP_COMPLETED"
		});
	}

	const user = await createUser(req, res, next, {
		email,
		password,
		name
	});

	// set user as owner
	await database
		.update({
			isOwner: true
		})
		.from("users")
		.where({
			userId: user.userId
		});

	await database
		.update({
			title: siteTitle
		})
		.from("settings");

	res.status(201).send({ user });
};
