// utils
const logger = require("../../utils/logger");

exports.up = function(knex) {
	return knex.schema
		.createTable("posts", table => {
			table
				.uuid("postId")
				.notNullable()
				.unique()
				.primary();
			table.string("title", 100).notNullable();
			table
				.string("slug", 150)
				.notNullable()
				.unique();
			table.string("slugId", 20).notNullable();
			table.text("contentMarkdown");
			table
				.uuid("userId")
				.references("userId")
				.inTable("users")
				.notNullable();
			table.timestamp("createdAt", { useTz: true }).notNullable();
			table.timestamp("updatedAt", { useTz: true }).notNullable();
			table.comment("Storing posts data");
		})
		.then(() => {
			logger.log({
				level: "info",
				message: "Create 'posts' table"
			});
		})
		.catch(err => {
			logger.log({
				level: "error",
				message: err
			});
		});
};

exports.down = function(knex) {
	return knex.schema
		.hasTable("posts")
		.then(exists => {
			if (exists) {
				return knex.schema
					.alterTable("posts", table => {
						table.dropForeign("userId");
					})
					.dropTable("posts");
			}
		})
		.then(() => {
			logger.log({
				level: "info",
				message: "Drop 'posts' table"
			});
		})
		.catch(err => {
			logger.log({
				level: "error",
				message: err
			});
		});
};
