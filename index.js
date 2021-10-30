const startTime = Date.now();

const ssr = require("@logchimp/theme");
const app = require("@logchimp/api");

// utils
const logger = require("@logchimp/api/utils/logger");
const logchimpConfig = require("@logchimp/api/utils/logchimpConfig");
const config = logchimpConfig();

// start express server at SERVER_PORT
const port = config.server.port || 3000;
const host = config.server.host || "127.0.0.1";

app.listen(port, host, async () => {
	if (!config?.theme.standalone) {
		const nuxt = await ssr();
		app.use(nuxt.render);
	}

	logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
	logger.info(`Listening on port: ${port}`);
	logger.info("Ctrl+C to shut down");
	logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
});
