// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const isSiteSetup = async (req, res) => {
	try {
		const { rows: getOwnerUser } = await database.raw(`
			SELECT
				EXISTS (
					SELECT
						roles.id,
						roles.name,
						roles_users.user_id
					FROM
						roles
					LEFT JOIN roles_users ON roles_users.role_id = roles.id
				WHERE
					roles.name = 'owner'
					AND roles_users.user_id IS NOT NULL
				LIMIT 1
			);
		`);

		const user = getOwnerUser[0].exists;
		res.status(200).send({
			is_setup: user
		});
	} catch (err) {
		logger.error({
			message: err.message
		});
	}
};

module.exports = isSiteSetup;
