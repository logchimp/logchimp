// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("settings", (table) => {
      table.string("title");
      table.string("description");
      table.string("logo");
      table.string("icon");
      table.string("accentColor", 6);
      table.string("googleAnalyticsId");
      table.boolean("isPoweredBy").defaultTo(true);
      table.boolean("allowSignup").defaultTo(true);
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: settings",
      });
    })
    .catch((err) => {
      logger.error({
        code: "DATABASE_MIGRATIONS",
        err,
      });
    });
};

exports.down = (knex) => {
  return knex.schema
    .hasTable("settings")
    .then((exists) => {
      if (exists) {
        return knex.schema.dropTable("settings");
      }
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Dropping table: settings",
      });
    })
    .catch((err) => {
      logger.error({
        code: "DATABASE_MIGRATIONS",
        err,
      });
    });
};
