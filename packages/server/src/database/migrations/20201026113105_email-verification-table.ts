import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("emailVerification", (table) => {
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
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Creating table: emailVerification",
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.hasTable("emailVerification").then(async (exists) => {
      if (exists) {
        await knex.schema.dropTable("emailVerification");
      }
    });

    logger.info({
      message: "Dropping table: emailVerification",
    });
  } catch (err) {
    logger.error(err);
  }
}
