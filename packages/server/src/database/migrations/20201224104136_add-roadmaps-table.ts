import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("roadmaps", (table) => {
      table.uuid("id").notNullable().unique().primary();
      table.string("name", 50).notNullable();
      table.string("url", 50).notNullable().unique();
      table.integer("index").notNullable();
      table.string("color", 6).notNullable();
      table.boolean("display").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: roadmaps",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("roadmaps");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: roadmaps",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: err,
    });
    throw err;
  }
}
