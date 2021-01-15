const { v4: uuidv4 } = require("uuid");

// database
const database = require("../../database");

// utils
const logger = require("../../utils/logger");

module.exports = async (req, res) => {
	try {
		const createRole = await database
			.insert({
				id: uuidv4(),
				name: "new role"
			})
			.into("roles")
			.returning("id");

		const role = createRole[0];

		res.status(201).send({
			role
		});
	} catch (err) {
		logger.error({
			message: err
		});
	}
};
