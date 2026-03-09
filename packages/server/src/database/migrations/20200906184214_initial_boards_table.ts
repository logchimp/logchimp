import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("boards", (table) => {
      table.uuid("boardId").notNullable().unique().primary();
      table.string("name", 50).notNullable();
      table.string("url", 50).notNullable().unique();
      table.string("color", 6).notNullable();
      table.boolean("display").defaultTo(false);
      table.boolean("view_voters").defaultTo(true);
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing boards data");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: boards",
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
    const exists = await knex.schema.hasTable("boards");
    if (exists) {
      await knex.schema.dropTable("boards");
    }

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: boards",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: err,
    });
    throw err;
  }
}
