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
      message: "Table created: emailVerification",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasTable("emailVerification");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing table: emailVerification",
      });
      return;
    }

    await knex.schema.dropTableIfExists("emailVerification");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: emailVerification",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
