const startTime = Date.now();

const path = require("path");
const express = require("express");

const app = require("./server/app");

// utils
const logger = require("./server/utils/logger");
const logchimpConfig = require("./server/utils/logchimpConfig");
const config = logchimpConfig();

// Serve vue app
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.resolve(__dirname, "public")));
	app.get(/.*/, (req, res) =>
		res.sendFile(path.resolve(__dirname, "public/index.html"))
	);
}

// start express server at SERVER_PORT
const port = config.server.port || 3000;
app.listen(port, () => {
	logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
	logger.info(`Listening on port: ${port}`);
	logger.info("Ctrl+C to shut down");
	logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
});
