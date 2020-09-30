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
			logger.log({
				level: "info",
				message: "Add 'boardId' column in 'posts' table"
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
				message: "Remove 'boardId' column from 'posts' table"
			});
		})
		.catch(err => {
			logger.log({
				level: "error",
				message: err
			});
		});
};
