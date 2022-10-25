// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("permissions", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table.string("name", 30);
      table.string("type", 20).notNullable();
      table.string("action", 10).notNullable();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: permissions",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable("permissions")
    .then(() => {
      logger.info({
        message: "Dropping table: permissions",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
