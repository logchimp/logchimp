import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", (table) => {
      table.text("notes");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column added: notes in users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: 'Error adding column: notes in users',
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasColumn("users", "notes");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing column: notes",
      });
      return;
    }

    await knex.schema.table("users", (table) => {
      table.dropColumn("notes");
    });
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column dropped: notes in users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: 'Error dropping column: notes in users',
      err,
    });
    throw err;
  }
}
