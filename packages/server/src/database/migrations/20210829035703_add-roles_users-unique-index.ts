import type { Knex } from "knex";
import logger from "../../utils/logger";

/**
 * IF EXISTS used as fail-safe for dropping the CONSTRAINT 'role_id_user_id_unique_index'
 * on ID in roles_users table. The unique index have already been removed from '20201125214155_roles-user-table' migration.
 */
export async function up(knex: Knex): Promise<void> {
  try {
    await knex.raw(
      `
      CREATE UNIQUE INDEX "role_id_user_id_unique_index" ON "roles_users"("role_id", "user_id");

      ALTER TABLE roles_users DROP CONSTRAINT IF EXISTS roles_users_id_unique;
    `,
    );

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Index created: role_id_user_id_unique_index",
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
    await knex.raw("DROP INDEX role_id_user_id_unique_index;");

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Index dropped: role_id_user_id_unique_index",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
