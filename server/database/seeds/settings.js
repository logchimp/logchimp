// utils
const logger = require("../../utils/logger");

exports.seed = function(knex) {
	return knex
		.select()
		.from("settings")
		.limit(1)
		.then(response => {
			if (!response[0]) {
				return knex("settings")
					.insert([
						{
							title: "LogChimp",
							description: "Track user feedback to build better products",
							accentColor: "484d7c",
							logo:
								"https://logchimp.codecarrot.net/images/logchimp-logo_circle.png",
							icon:
								"https://logchimp.codecarrot.net/images/logchimp-logo_circle.png",
							isPoweredBy: true
						}
					])
					.then(() => {
						logger.info({
							code: "DATABASE_SEEDS",
							message: "Insert data: settings"
						});
					})
					.catch(err => {
						logger.error({
							code: "DATABASE_SEEDS",
							err
						});
					});
			}
		})
		.catch(err => {
			logger.error({
				code: "DATABASE",
				message: "Query settings",
				err
			});
		});
};
