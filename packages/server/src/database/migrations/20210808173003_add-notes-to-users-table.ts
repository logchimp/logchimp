import type { Knex } from "knex";
import logger from "../../utils/logger";

exports.up = (knex: Knex) => {
  return knex.schema
    .table("users", (table) => {
      table.text("notes");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Adding column: notes in users",
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
    .hasColumn("users", "notes")
    .then((exists) => {
      if (exists) {
        return knex.schema.table("users", (table) => {
          table.dropColumn("notes");
        });
      }
    })
    .then(() => {
      logger.log({
        level: "info",
        message: "Dropping column: notes in users",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
