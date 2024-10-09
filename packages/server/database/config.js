const isBoolean = require("lodash/isBoolean");

// modules
const path = require("path");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();

const ssl =
  isBoolean(process.env.LOGCHIMP_DB_SSL) || config?.database?.ssl
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
    host: process.env.LOGCHIMP_DB_HOST || config.database.host,
    user: process.env.LOGCHIMP_DB_USER || config.database.user,
    password: process.env.LOGCHIMP_DB_PASSWORD || config.database.password,
    database: process.env.LOGCHIMP_DB_DATABASE || config.database.name,
    port: process.env.LOGCHIMP_DB_PORT || config.database.port,
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
