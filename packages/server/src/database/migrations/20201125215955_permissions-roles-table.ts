import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("permissions_roles", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table
        .uuid("permission_id")
        .notNullable()
        .references("id")
        .inTable("permissions")
        .onDelete("cascade");
      table
        .uuid("role_id")
        .notNullable()
        .references("id")
        .inTable("roles")
        .onDelete("cascade");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: permissions_roles",
    });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("permissions_roles");

    logger.info({
      message: "Table dropped: permissions_roles",
    });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}
