import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("posts_activity", (table) => {
      table.uuid("id").notNullable().primary();
      table.string("type", 50).notNullable();
      table
        .uuid("posts_comments_id")
        .references("id")
        .inTable("posts_comments");
      table.uuid("post_id").references("postId").inTable("posts").notNullable();
      table
        .uuid("author_id")
        .references("userId")
        .inTable("users")
        .notNullable();
      table.timestamp("created_at").notNullable();
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: posts_activity",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating table posts_activity",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("posts_activity");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: posts_activity",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping table posts_activity",
      err,
    });
    throw err;
  }
}
