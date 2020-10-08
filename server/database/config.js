// modules
const path = require("path");

const packageJson = require("../package.json");

// utils
const logger = require("../utils/logger");

const ssl =
	process.env.NODE_ENV === "production"
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
		host: process.env.PG_HOST,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		port: process.env.PG_PORT,
		...ssl
	},
	currentVersion: packageJson.version,
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
