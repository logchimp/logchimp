import type { Knex } from "knex";
import logger from "../../utils/logger";

exports.up = (knex: Knex) => {
  return knex.schema
    .table("settings", (table) => {
      table.boolean("developer_mode").defaultTo(false);
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Adding column: developer_mode in settings",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};

exports.down = (knex: Knex) => {
  return knex.schema
    .table("settings", (table) => {
      table.dropColumn("developer_mode");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Dropping column: developer_mode in settings",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
