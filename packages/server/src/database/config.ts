import path from "path";

// utils
import logger from "../utils/logger";
import { configManager } from "../utils/logchimpConfig";
const config = configManager.getConfig();

const ssl = config.databaseSsl
  ? {
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {};

const dbConfig = {
  client: "pg",
  version: "12.4",
  connection: {
    host: config.databaseHost,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseName,
    port: config.databasePort,
    ...ssl,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
    tableName: "migrations",
  },
  seeds: {
    directory: path.resolve(__dirname, "seed"),
  },
  log: {
    warn(err) {
      logger.warn({
        code: "DATABASE",
        message: err.toString(),
      });
    },
    error(err) {
      logger.error({
        code: "DATABASE",
        message: err.toString(),
      });
    },
    deprecate(err) {
      logger.info({
        code: "DATABASE",
        message: err.toString(),
      });
    },
    debug(err) {
      logger.debug({
        code: "DATABASE",
        message: err.toString(),
      });
    },
  },
};

export default dbConfig;
