import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", (table) => {
      table.text("notes");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Adding column: notes in users",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.hasColumn("users", "notes").then(async (exists) => {
      if (exists) {
        await knex.schema.table("users", (table) => {
          table.dropColumn("notes");
        });
      }
    });

    logger.log({
      level: "info",
      message: "Dropping column: notes in users",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}
