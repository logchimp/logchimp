// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("roles", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table.string("name", 30).notNullable();
      table.string("description", 50);
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: roles",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable("roles")
    .then(() => {
      logger.info({
        message: "Dropping table: roles",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
