import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("roles", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table.string("name", 30).notNullable();
      table.string("description", 50);
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Creating table: roles",
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("roles");

    logger.info({
      message: "Dropping table: roles",
    });
  } catch (err) {
    logger.error(err);
  }
}
