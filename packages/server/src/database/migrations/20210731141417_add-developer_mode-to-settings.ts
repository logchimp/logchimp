import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("settings", (table) => {
      table.boolean("developer_mode").defaultTo(false);
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column added: developer_mode in settings",
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
    await knex.schema.table("settings", (table) => {
      table.dropColumn("developer_mode");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column dropped: developer_mode in settings",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}
