// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("posts", (table) => {
      table.uuid("postId").notNullable().unique().primary();
      table.string("title", 100).notNullable();
      table.string("slug", 150).notNullable().unique();
      table.string("slugId", 20).notNullable();
      table.text("contentMarkdown");
      table.uuid("userId").references("userId").inTable("users").notNullable();
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing posts data");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: posts",
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
    .hasTable("posts")
    .then((exists) => {
      if (exists) {
        return knex.schema
          .alterTable("posts", (table) => {
            table.dropForeign("userId");
          })
          .dropTable("posts");
      }
    })
    .then(() => {
      logger.log({
        level: "info",
        message: "Dropping table: posts",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
