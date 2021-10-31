const database = require("./database");

const app = require("./app")

// utils
const logger = require("./utils/logger");

// run database migrations
database.migrate
	.latest()
	.then(() => {
		logger.info("Database migration complete");
	})
	.catch((err) => {
		logger.error({
			code: "DATABASE_MIGRATIONS",
			message: err
		});

		if (err.message === "SSL/TLS required") {
			logger.error({
				code: "DATABASE_CONNECTION",
				message: "Enable SSL/TLS on your database connection"
			});

			logger.error({
				code: "DATABASE_CONNECTION",
				message: `Connecting to database at ${err.address}:${err.port}`,
				err
			});
		}
	});

module.exports = app;
