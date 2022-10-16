// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("resetPassword", (table) => {
      table
        .string("email", 320)
        .notNullable()
        .unique()
        .primary()
        .references("email")
        .inTable("users")
        .onDelete("cascade");
      table.string("token", 320).notNullable().unique();
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: resetPassword",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .hasTable("resetPassword")
    .then((exists) => {
      if (exists) {
        return knex.schema.dropTable("resetPassword");
      }
    })
    .then(() => {
      logger.info({
        message: "Dropping table: resetPassword",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
