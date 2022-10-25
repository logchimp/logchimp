// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
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

exports.down = (knex) => {
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
