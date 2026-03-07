import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("posts", (table) => {
      table.uuid("postId").notNullable().unique().primary();
      table.string("title", 100).notNullable();
      table.string("slug", 150).notNullable().unique();
      table.string("slugId", 20).notNullable();
      table.text("contentMarkdown");
      table.uuid("userId").references("userId").inTable("users").notNullable();
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing posts data");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Creating table: posts",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.hasTable("posts").then(async (exists) => {
      if (exists) {
        await knex.schema
          .alterTable("posts", (table) => {
            table.dropForeign("userId");
          })
          .dropTable("posts");
      }
    });

    logger.log({
      level: "info",
      message: "Dropping table: posts",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
