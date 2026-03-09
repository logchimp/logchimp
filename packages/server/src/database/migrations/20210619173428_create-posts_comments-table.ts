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
      message: "Table created: posts_comments",
    });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasTable("posts_comments");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing table: posts_comments",
      });
      return;
    }

    await knex.schema.dropTable("posts_comments");
    logger.info({
      message: "Table dropped: posts_comments",
    });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}
