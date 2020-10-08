// utils
const logger = require("../../utils/logger");

exports.up = function(knex) {
	return knex.schema
		.table("posts", table => {
			table
				.uuid("boardId")
				.references("boardId")
				.inTable("boards");
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Adding column: boardId in posts"
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
		.hasColumn("posts", "boardId")
		.then(exists => {
			if (exists) {
				return knex.schema.table("posts", table => {
					table.dropColumn("boardId");
				});
			}
		})
		.then(() => {
			logger.log({
				level: "info",
				message: "Dropping column: boardId in posts"
			});
		})
		.catch(err => {
			logger.log({
				level: "error",
				message: err
			});
		});
};
