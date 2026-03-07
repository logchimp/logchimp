import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("posts_comments", (table) => {
      table.uuid("id").notNullable().primary();
      table.uuid("parent_id").references("id").inTable("posts_comments");
      table.uuid("activity_id").notNullable();
      table.string("body", 1000).notNullable();
      table.boolean("is_edited").defaultTo(false);
      table.boolean("is_spam").defaultTo(false);
      table.boolean("is_internal").defaultTo(false);
      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Creating table: posts_comments",
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.hasTable("posts_comments").then(async (exists) => {
      if (exists) {
        await knex.schema.dropTable("posts_comments");
      }
    });

    logger.info({
      message: "Dropping table: posts_comments",
    });
  } catch (err) {
    logger.error(err);
  }
}
