import type { Knex } from "knex";
import logger from "../../utils/logger";

exports.up = (knex: Knex) => {
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

exports.down = (knex: Knex) => {
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
