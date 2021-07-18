// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex.schema
		.createTable("posts_status", table => {
			table
				.uuid("id")
				.notNullable()
				.primary();
			table.uuid("activity_id").notNullable();
			table.timestamp("created_at").notNullable();
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Creating table: posts_comments"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};

exports.down = knex => {
	return knex.schema
		.hasTable("posts_comments")
		.then(exists => {
			if (exists) {
				return knex.schema.dropTable("posts_comments");
			}
		})
		.then(() => {
			logger.info({
				message: "Dropping table: posts_comments"
			});
		})
		.catch(err => {
			logger.error(err);
		});
};
