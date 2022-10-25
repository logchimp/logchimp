// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("boards", (table) => {
      table.uuid("boardId").notNullable().unique().primary();
      table.string("name", 50).notNullable();
      table.string("url", 50).notNullable().unique();
      table.string("color", 6).notNullable();
      table.boolean("display").defaultTo(false);
      table.boolean("view_voters").defaultTo(true);
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing boards data");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: boards",
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
    .hasTable("boards")
    .then((exists) => {
      if (exists) {
        return knex.schema.dropTable("boards");
      }
    })
    .then(() => {
      logger.log({
        level: "info",
        message: "Dropping table: boards",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
