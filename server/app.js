const startTime = Date.now();

// modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const routes = require("./routes/v1");

const app = express();

const database = require("./database");

// utils
const logger = require("./utils/logger");

database
	.raw("select 1+1 as result")
	.then(() => {
		database.migrate
			.latest()
			.then(() => {
				database.seed
					.run()
					.then(() => {
						logger.info("Database migration complete");

						// contains key-value pairs of data submitted in the request body
						app.use(bodyParser.json());

						// enable all CORS requests
						app.use(cors());

						// importing all routes modules
						app.use(routes);

						// Serve vue app
						if (process.env.NODE_ENV === "production") {
							app.use(express.static(path.resolve(__dirname, "public")));
							app.get(/.*/, (req, res) =>
								res.sendFile(path.resolve(__dirname, "public/index.html"))
							);
						}

						// start express server at SERVER_PORT
						const port = process.env.PORT || 3000;
						app.listen(port, () => {
							logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
							logger.info(`Listening on port: ${port}`);
							logger.info("Ctrl+C to shut down");
							logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
						});
					})
					.catch(err => {
						logger.error({
							code: "DATABASE_SEEDS",
							message: "Seeding failed",
							err
						});
					});
			})
			.catch(err => {
				logger.error({
					code: "DATABASE_MIGRATIONS",
					message: "Migrations failed",
					err
				});
			});
	})
	.catch(err => {
		if (err.message === "SSL/TLS required") {
			logger.error({
				code: "DATABASE_CONNECTION",
				message: "Enable SSL/TLS on your database connection"
			});
		}

		logger.error({
			code: "DATABASE_CONNECTION",
			message: `Connecting to database at ${err.address}:${err.port}`,
			err
		});
	});
