import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("users", (table) => {
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
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating table users",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("users");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping table users",
      err,
    });
    throw err;
  }
}
