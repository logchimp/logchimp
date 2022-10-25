// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("posts_activity", (table) => {
      table.uuid("id").notNullable().primary();
      table.string("type", 50).notNullable();
      table
        .uuid("posts_comments_id")
        .references("id")
        .inTable("posts_comments");
      table.uuid("post_id").references("postId").inTable("posts").notNullable();
      table
        .uuid("author_id")
        .references("userId")
        .inTable("users")
        .notNullable();
      table.timestamp("created_at").notNullable();
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: posts_activity",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .hasTable("posts_activity")
    .then((exists) => {
      if (exists) {
        return knex.schema.dropTable("posts_activity");
      }
    })
    .then(() => {
      logger.info({
        message: "Dropping table: posts_activity",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
