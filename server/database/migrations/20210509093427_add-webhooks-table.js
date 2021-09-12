// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
	return knex.schema
		.createTable("webhooks", (table) => {
			table.uuid("id").notNullable().primary();
			table.string("name", 200).notNullable();
			table.string("event", 50);
			table.string("description", 1000);
			table.string("target_url", 2000);
			table.string("status", 50).defaultTo("available").notNullable();
			table.timestamp("last_triggered_at");
			table.integer("last_triggered_status");
			table.string("last_triggered_error", 100);
			table.timestamp("created_at").notNullable();
			table.timestamp("updated_at").notNullable();
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Creating table: webhooks"
			});
		})
		.catch((err) => {
			logger.error(err);
		});
};

exports.down = (knex) => {
	return knex.schema
		.dropTable("webhooks")
		.then(() => {
			logger.info({
				message: "Dropping table: webhooks"
			});
		})
		.catch((err) => {
			logger.error(err);
		});
};
