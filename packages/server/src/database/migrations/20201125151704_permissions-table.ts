import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("permissions", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table.string("name", 30);
      table.string("type", 20).notNullable();
      table.string("action", 10).notNullable();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating table permissions",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("permissions");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping table permissions",
      err,
    });
    throw err;
  }
}
