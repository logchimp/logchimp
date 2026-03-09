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
      message: "Table created: roles_users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating table roles_users",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("roles_users");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: roles_users",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping table roles_users",
      err,
    });
    throw err;
  }
}
