// utils
const logger = require("../../utils/logger");

exports.up = (knex) => {
  return knex.schema
    .createTable("users", (table) => {
      table.uuid("userId").notNullable().unique().primary();
      table.string("name", 30);
      table.string("email", 320).notNullable().unique();
      table.string("password", 72).notNullable();
      table.string("username", 30).notNullable().unique();
      table.text("avatar");
      table.boolean("isVerified").defaultTo(false);
      table.boolean("isOwner").defaultTo(false);
      table.boolean("isBlocked").defaultTo(false);
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing users data");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating table: users",
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
    .hasTable("users")
    .then((exists) => {
      if (exists) {
        return knex.schema.dropTable("users");
      }
    })
    .then(() => {
      logger.log({
        level: "info",
        message: "Dropping table: users",
      });
    })
    .catch((err) => {
      logger.log({
        level: "error",
        message: err,
      });
    });
};
