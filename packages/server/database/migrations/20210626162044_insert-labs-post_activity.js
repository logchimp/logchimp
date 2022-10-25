// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .table("settings", (table) => {
      table.text("labs").defaultTo("{}");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Insert column 'labs' into settings",
      });
    })
    .then(() => {
      return knex("settings").update({
        labs: knex.raw("labs::jsonb || '{\"comments\": false}'"),
      });
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Insert 'comments' into labs column",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("settings", (table) => {
      table.dropColumn("labs");
    })
    .then(() => {
      logger.info({
        message: "Dropping column 'labs' from settings",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
