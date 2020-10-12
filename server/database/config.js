// modules
const path = require("path");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../../utils/logchimpConfig");
const config = logchimpConfig();

const ssl = config.database.ssl
	? {
			ssl: {
				rejectUnauthorized: false
			}
	  }
	: {};

module.exports = {
	client: "pg",
	version: "12.4",
	connection: {
		host: config.database.host,
		user: config.database.user,
		password: config.database.password,
		database: config.database.name,
		port: config.database.port,
		...ssl
	},
	migrations: {
		directory: path.resolve(__dirname, "migrations"),
		tableName: "migrations"
	},
	seeds: {
		directory: path.resolve(__dirname, "seeds")
	},
	log: {
		warn(err) {
			logger.warn({
				code: "DATABASE",
				err
			});
		},
		error(err) {
			logger.error({
				code: "DATABASE",
				err
			});
		},
		deprecate(err) {
			logger.info({
				code: "DATABASE",
				err
			});
		},
		debug(err) {
			logger.debug({
				code: "DATABASE",
				err
			});
		}
	}
};
