import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("permissions", (table) => {
      table.string("type", 30).alter();
      table.string("action", 25).alter();
    });
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Increased varchar length for type and action in permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message:
        "Error increasing varchar length for type and action in permissions",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("permissions", (table) => {
      table.string("type", 20).alter();
      table.string("action", 10).alter();
    });
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Reverted varchar length for type and action in permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message:
        "Error reverting varchar length for type and action in permissions",
      err,
    });
    throw err;
  }
}
