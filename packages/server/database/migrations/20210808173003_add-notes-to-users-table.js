// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
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

exports.down = (knex) => {
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
