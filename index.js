const startTime = Date.now();

const theme = require("@logchimp/theme");
const api = require("@logchimp/api");

// utils
const logger = require("@logchimp/api/utils/logger");
const logchimpConfig = require("@logchimp/api/utils/logchimpConfig");
const config = logchimpConfig();

// start express server at SERVER_PORT
const port = config.server.port || 3000;
const host = config.server.host || "0.0.0.0";

api.listen(port, host, async () => {
	if (!config?.theme.standalone) {
		const nuxt = await theme();
		api.use(nuxt.render);
	}

	logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
	logger.info(`Listening on port: ${port}`);
	logger.info("Ctrl+C to shut down");
	logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
});
