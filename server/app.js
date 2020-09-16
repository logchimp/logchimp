require("dotenv").config({ path: "../.env" });

// modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = require("./routes/v1");
const { errorHandler, notFound } = require("./middlewares");

const app = express();

const database = require("./database");

database
	.raw("select 1+1 as result")
	.then(() => {
		database.migrate
			.latest()
			.then(() => {
				console.log("Database setup complete");

				// start express server at SERVER_PORT
				app.listen(process.env.SERVER_PORT, () => {
					// contains key-value pairs of data submitted in the request body
					app.use(bodyParser.json());

					// enable all CORS requests
					app.use(cors());

					// importing all routes modules
					app.use(routes);

					// Error handler middlewares
					app.use(notFound);
					app.use(errorHandler);

					console.log(`Listening at port: ${process.env.SERVER_PORT}`);
				});
			})
			.catch(error => {
				console.error(error);
			});
	})
	.catch(error => {
		console.error(error);
	});
