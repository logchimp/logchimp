import type { Knex } from "knex";
import logger from "../../utils/logger";

exports.up = (knex: Knex) => {
  return knex.schema
    .createTable("permissions_roles", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table
        .uuid("permission_id")
        .notNullable()
        .references("id")
        .inTable("permissions")
        .onDelete("cascade");
      table
        .uuid("role_id")
        .notNullable()
        .references("id")
        .inTable("roles")
        .onDelete("cascade");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: permissions_roles",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex: Knex) => {
  return knex.schema
    .dropTable("permissions_roles")
    .then(() => {
      logger.info({
        message: "Dropping table: permissions_roles",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
