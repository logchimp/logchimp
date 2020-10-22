// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex.schema
		.table("users", table => {
			table
				.string("resetPasswordToken")
				.comment("Stores single auto-generated crypto buffer hash token");
			table
				.string("resetPasswordExpires")
				.comment("Expire time should be greater than current time");
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message:
					"Add column: resetPasswordToken and resetPasswordExpires in users"
			});
		})
		.catch(err => {
			logger.error({
				err
			});
		});
};

exports.down = knex => {
	return Promise.all([
		knex.schema
			.hasColumn("users", "resetPasswordToken")
			.then(exists => {
				if (exists) {
					return knex.schema.table("users", table => {
						table.dropColumn("resetPasswordToken");
					});
				}
			})
			.then(() => {
				logger.log({
					level: "info",
					message: "Dropping column: resetPasswordToken in users"
				});
			})
			.catch(err => {
				logger.error({
					err
				});
			}),
		knex.schema
			.hasColumn("users", "resetPasswordExpires")
			.then(exists => {
				if (exists) {
					return knex.schema.table("users", table => {
						table.dropColumn("resetPasswordExpires");
					});
				}
			})
			.then(() => {
				logger.log({
					level: "info",
					message: "Dropping column: resetPasswordExpires in users"
				});
			})
			.catch(err => {
				logger.error({
					err
				});
			})
	]);
};
