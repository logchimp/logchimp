// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
	return knex.schema
		.createTable("post_activity", (table) => {
			table.uuid("id").notNullable().primary();
			table.uuid("parent_id").references("id").inTable("post_activity");
			table.string("body", 1000).notNullable();
			table.string("type", 50).notNullable();
			table
				.uuid("author_id")
				.references("userId")
				.inTable("users")
				.notNullable();
			table
				.uuid("post_id")
				.references("postId")
				.inTable("posts")
				.notNullable();
			table.boolean("is_edited").defaultTo(false);
			table.boolean("is_spam").defaultTo(false);
			table.boolean("is_internal").defaultTo(false);
			table.timestamp("created_at").notNullable();
			table.timestamp("updated_at").notNullable();
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Creating table: post_activity"
			});
		})
		.catch((err) => {
			logger.error(err);
		});
};

exports.down = (knex) => {
	return knex.schema
		.hasTable("post_activity")
		.then((exists) => {
			if (exists) {
				return knex.schema.dropTable("post_activity");
			}
		})
		.then(() => {
			logger.info({
				message: "Dropping table: post_activity"
			});
		})
		.catch((err) => {
			logger.error(err);
		});
};
