// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .table("posts", (table) => {
      table
        .uuid("roadmap_id")
        .references("id")
        .inTable("roadmaps")
        .onDelete("set null");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Add column: roadmap_id in posts",
      });
    })
    .catch((err) => {
      logger.error({
        message: err,
      });
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("posts", (table) => {
      table.dropColumn("roadmap_id");
    })
    .then(() => {
      logger.info({
        message: "Drop column: roadmap_id in posts",
      });
    })
    .catch((err) => {
      logger.error({
        message: err,
      });
    });
};
