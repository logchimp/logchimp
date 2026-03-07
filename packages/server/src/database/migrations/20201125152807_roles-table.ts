import type { Knex } from "knex";
import logger from "../../utils/logger";

exports.up = (knex: Knex) => {
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

exports.down = (knex: Knex) => {
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
