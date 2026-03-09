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
      message: "Column added: boardId in posts",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasColumn("posts", "boardId");
    if (exists) {
      await knex.schema.table("posts", (table) => {
        table.dropColumn("boardId");
      });
    }

    logger.log({
      level: "info",
      message: "Column dropped: boardId in posts",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}
