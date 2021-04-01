const startTime = Date.now();

const app = require("./server");
const database = require("./server/database");

// utils
const logger = require("./server/utils/logger");
const logchimpConfig = require("./server/utils/logchimpConfig");
const config = logchimpConfig();

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

// start express server at SERVER_PORT
const port = config.server.port || 3000;
app.listen(port, () => {
	logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
	logger.info(`Listening on port: ${port}`);
	logger.info("Ctrl+C to shut down");
	logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
});
