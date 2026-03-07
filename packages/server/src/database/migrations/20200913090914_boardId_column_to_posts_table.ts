import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("posts", (table) => {
      table
        .uuid("boardId")
        .references("boardId")
        .inTable("boards")
        .onDelete("set null");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Adding column: boardId in posts",
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
    await knex.schema.hasColumn("posts", "boardId").then(async (exists) => {
      if (exists) {
        await knex.schema.table("posts", (table) => {
          table.dropColumn("boardId");
        });
      }
    });

    logger.log({
      level: "info",
      message: "Dropping column: boardId in posts",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
