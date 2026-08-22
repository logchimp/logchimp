const startTime = Date.now();

import app from "./app";
import { ready as routesReady } from "./routes/v1";

import { createWorkerClient } from "./worker/client";
import { mailQueue } from "./worker/tasks/mail";
import { mailWorker } from "./worker/handler/mail";

// utils
import logger from "./utils/logger";
import { configManager } from "./utils/logchimpConfig";

const config = configManager.getConfig();

// start express server at SERVER_PORT
const port = config.serverPort || 8000;
const host = config.serverHost || "0.0.0.0";

(async () => {
  await routesReady;

  // Run background worker
  const connection = await createWorkerClient();
  mailQueue.init(connection);
  await mailWorker.run(connection);

  app.listen(port, host, async () => {
    logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
    logger.info(`Listening on port: ${port}`);
    logger.info("Ctrl+C to shut down");
    logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
  });
})();
