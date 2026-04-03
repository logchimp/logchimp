const startTime = Date.now();

import app from "./app";
import { ready as routesReady } from "./routes/v1";

// utils
import logger from "./utils/logger";
import { configManager } from "./utils/logchimpConfig";

const config = configManager.getConfig();

// start express server at SERVER_PORT
const port = config.serverPort || 8000;
const host = config.serverHost || "0.0.0.0";

(async () => {
  await routesReady;

  app.listen(port, host, async () => {
    logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
    logger.info(`Listening on port: ${port}`);
    logger.info("Ctrl+C to shut down");
    logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
  });
})();
