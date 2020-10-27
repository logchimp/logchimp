// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex.schema
		.createTable("emailVerification", table => {
			table
				.string("emailAddress", 320)
				.notNullable()
				.unique()
				.primary();
			table
				.string("token")
				.notNullable()
				.unique();
			table.timestamp("createdAt", { useTz: true }).notNullable();
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Creating table: emailVerification"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};

exports.down = knex => {
	return knex.schema
		.hasTable("emailVerification")
		.then(exists => {
			if (exists) {
				return knex.schema.dropTable("emailVerification");
			}
		})
		.then(() => {
			logger.info({
				message: "Dropping table: emailVerification"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};
