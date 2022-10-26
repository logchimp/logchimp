// modules
const path = require("path");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();

const ssl = config.database.ssl
  ? {
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {};

module.exports = {
  client: "pg",
  version: "12.4",
  connection: {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    port: config.database.port,
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
