// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex.schema
		.createTable("roles_users", table => {
			table
				.uuid("id")
				.notNullable()
				.unique()
				.primary();
			table.uuid("role_id").notNullable();
			table.uuid("user_id").notNullable();
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Creating table: roles_users"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};

exports.down = knex => {
	return knex.schema
		.dropTable("roles_users")
		.then(() => {
			logger.info({
				message: "Dropping table: roles_users"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};
