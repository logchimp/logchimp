// utils
const logger = require("../../utils/logger");

/**
 * IF EXISTS used as fail-safe for dropping the CONSTRAINT 'role_id_user_id_unique_index'
 * on ID in roles_users table. The unique index have already been removed from '20201125214155_roles-user-table' migration.
 */
exports.up = (knex) => {
  return knex
    .raw(
      `
      CREATE UNIQUE INDEX "role_id_user_id_unique_index" ON "roles_users"("role_id", "user_id");

      ALTER TABLE roles_users DROP CONSTRAINT IF EXISTS roles_users_id_unique;
    `,
    )
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message: "Creating index: role_id_user_id_unique_index",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex
    .raw("DROP INDEX role_id_user_id_unique_index;")
    .then(() => {
      logger.info({
        message: "Dropping index: role_id_user_id_unique_index",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
