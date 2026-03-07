import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("roles_users", (table) => {
      table.uuid("id").notNullable().primary();
      table
        .uuid("role_id")
        .notNullable()
        .references("id")
        .inTable("roles")
        .onDelete("cascade");
      table
        .uuid("user_id")
        .notNullable()
        .references("userId")
        .inTable("users")
        .onDelete("cascade");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Creating table: roles_users",
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("roles_users");

    logger.info({
      message: "Dropping table: roles_users",
    });
  } catch (err) {
    logger.error(err);
  }
}
