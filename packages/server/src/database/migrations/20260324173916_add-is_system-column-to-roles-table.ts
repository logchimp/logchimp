import type { Knex } from "knex";

import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.transaction(async (trx) => {
      await trx.schema.table("roles", (table) => {
        table.smallint("is_system").defaultTo(0);
      });
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Add is_system column to 'roles' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error adding is_system column to 'roles' table",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.transaction(async (trx) => {
      await trx.schema.table("roles", (table) => {
        table.dropColumn("is_system");
      });
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Drop is_system column from 'roles' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping is_system column from 'roles' table",
      err,
    });
    throw err;
  }
}
