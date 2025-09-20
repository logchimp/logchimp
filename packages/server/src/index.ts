const startTime = Date.now();

import database from "./database";
import app from "./app";

// utils
import logger from "./utils/logger";
import { configManager } from "./utils/logchimpConfig";

// run database migrations
database.migrate
  .latest()
  .then(() => {
    logger.info("Database migration complete");
  })
  .catch((err) => {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: err,
    });

    if (err.message === "SSL/TLS required") {
      logger.error({
        code: "DATABASE_CONNECTION",
        message: "Enable SSL/TLS on your database connection",
      });

      logger.error({
        code: "DATABASE_CONNECTION",
        message: `Connecting to database at ${err.address}:${err.port}`,
        err,
      });
    }
  });

const config = configManager.getConfig();

// start express server at SERVER_PORT
const port = config.serverPort || 8000;
const host = config.serverHost || "0.0.0.0";

app.listen(port, host, async () => {
  logger.info(`LogChimp is running in ${process.env.NODE_ENV}...`);
  logger.info(`Listening on port: ${port}`);
  logger.info("Ctrl+C to shut down");
  logger.info(`LogChimp boot ${(Date.now() - startTime) / 1000}s`);
});
