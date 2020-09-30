// utils
const logger = require("../../utils/logger");

exports.up = function(knex) {
	return knex.schema
		.createTable("users", table => {
			table
				.uuid("userId")
				.notNullable()
				.unique()
				.primary();
			table.string("firstname", 30);
			table.string("lastname", 30);
			table
				.string("emailAddress", 320)
				.notNullable()
				.unique();
			table.string("password", 72).notNullable();
			table
				.string("username", 30)
				.notNullable()
				.unique();
			table.text("avatar");
			table.boolean("isVerified").defaultTo(false);
			table.boolean("isOwner").defaultTo(false);
			table.boolean("isModerator").defaultTo(false);
			table.boolean("isBlocked").defaultTo(false);
			table.timestamp("createdAt", { useTz: true }).notNullable();
			table.timestamp("updatedAt", { useTz: true }).notNullable();
			table.comment("Storing users data");
		})
		.then(() => {
			logger.log({
				level: "info",
				message: "Create 'users' table"
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
		.hasTable("users")
		.then(exists => {
			if (exists) {
				return knex.schema.dropTable("users");
			}
		})
		.then(() => {
			logger.log({
				level: "info",
				message: "Drop 'users' table"
			});
		})
		.catch(err => {
			logger.log({
				level: "error",
				message: err
			});
		});
};
