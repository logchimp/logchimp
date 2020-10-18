// utils
const logger = require("../../utils/logger");

exports.up = knex => {
	return knex.schema
		.table("settings", table => {
			table.string("googleAnalyticsId");
		})
		.then(() => {
			logger.info({
				code: "DATABASE_MIGRATIONS",
				message: "Add column: googleAnalyticsId in settings"
			});
		})
		.catch(err => {
			logger.error({
				err
			});
		});
};

exports.down = knex => {
	return knex.schema
		.hasColumn("settings", "googleAnalyticsId")
		.then(exists => {
			if (exists) {
				return knex.schema.table("settings", table => {
					table.dropColumn("googleAnalyticsId");
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
			logger.error({
				err
			});
		});
};
