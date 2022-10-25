// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("votes", (table) => {
      table.uuid("voteId").notNullable().unique().primary();
      table.uuid("userId").references("userId").inTable("users").notNullable();
      table
        .uuid("postId")
        .references("postId")
        .inTable("posts")
        .onDelete("cascade")
        .notNullable();
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing post votes data");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: votes",
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
    .hasTable("votes")
    .then((exists) => {
      if (exists) {
        return knex.schema
          .alterTable("votes", (table) => {
            table.dropForeign("userId");
            table.dropForeign("postId");
          })
          .dropTable("votes");
      }
    })
    .then(() => {
      logger.log({
        level: "info",
        message: "Dropping table: votes",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
