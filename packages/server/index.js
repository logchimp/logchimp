const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const database = require("./database");

const app = express();
app.disable("x-powered-by");

// utils
const logger = require("./utils/logger");
const logchimpConfig = require("./utils/logchimpConfig");
const config = logchimpConfig();
if (!config) {
	console.log(
		"LogChimp configuration missing!\nTry running this command 'logchimp install' again."
	);
	process.exit(1);
}

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// contains key-value pairs of data submitted in the request body
app.use(express.json());

// enable all CORS requests
app.use(cors());

// import all routes
app.use(routes);

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
