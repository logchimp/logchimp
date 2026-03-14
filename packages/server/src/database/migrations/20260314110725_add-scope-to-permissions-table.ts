import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("permissions", (table) => {
      table.string("scope", 20).nullable();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column added: scope in permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: `Error adding column: scope in permissions`,
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasColumn("permissions", "scope");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing column: scope",
      });
      return;
    }

    await knex.schema.table("permissions", (table) => {
      table.dropColumn("scope");
    });
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column dropped: scope in permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: `Error dropping column: scope in permissions`,
      err,
    });
    throw err;
  }
}
