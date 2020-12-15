// database
const database = require("../../database");

// services
const createUser = require("../../services/auth/createUser");

const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

async function checkIsSetup() {
	try {
		const {
			rows: [checkOwnerExists]
		} = await database.raw(`
			SELECT
				roles.id AS role_id,
				roles_users.user_id
			FROM
				roles
				LEFT JOIN roles_users ON roles_users.role_id = roles.id
			WHERE
				roles.name = 'owner'
			LIMIT 1;
		`);

		return checkOwnerExists;
	} catch (err) {
		logger.error(err);
	}
}

module.exports = async (req, res, next) => {
	const siteTitle = req.body.siteTitle;
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	const isSetup = await checkIsSetup();

	if (isSetup.user_id) {
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

	await database
		.update({
			role_id: isSetup.role_id
		})
		.from("roles_users");

	await database
		.update({
			title: siteTitle
		})
		.from("settings");

	res.status(201).send({ user });
};
