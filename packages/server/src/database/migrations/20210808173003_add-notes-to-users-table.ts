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
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasColumn("users", "notes");
    if (exists) {
      await knex.schema.table("users", (table) => {
        table.dropColumn("notes");
      });
    }

    logger.log({
      level: "info",
      message: "Column dropped: notes in users",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}
