const { v4: uuidv4 } = require("uuid");

// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex
		.insert([
			{
				id: uuidv4(),
				name: "ban",
				description: "Ban"
			},
			{
				id: uuidv4(),
				name: "user",
				description: "User"
			},
			{
				id: uuidv4(),
				name: "moderator",
				description: "Moderator"
			},
			{
				id: uuidv4(),
				name: "manager",
				description: "Manager"
			},
			{
				id: uuidv4(),
				name: "administrator",
				description: "Administrator"
			},
			{
				id: uuidv4(),
				name: "owner",
				description: "Owner"
			}
		])
		.into("roles")
		.then(() => {
			logger.info({
				code: "DATABASE_SEEDS",
				message: "Insert data: role"
			});
		})
		.catch(err => {
			logger.error({
				code: "DATABASE_SEEDS",
				message: err.message
			});
		});
};

exports.down = async knex => {
	try {
		await knex("roles").delete();

		logger.info({
			message: "Drop data: role"
		});
	} catch (err) {
		logger.error({
			code: "DATABASE_SEEDS",
			message: err.message
		});
	}
};
