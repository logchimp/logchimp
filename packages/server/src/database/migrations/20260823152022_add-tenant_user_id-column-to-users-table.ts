import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", (t) => {
      t.string("tenant_user_id").nullable().unique();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Added 'tenant_user_id' column to 'users' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error adding 'tenant_user_id' column to 'users' table",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", (t) => {
      t.dropColumn("tenant_user_id");
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error removing 'tenant_user_id' column from 'users' table",
    });
    throw err;
  }
}
