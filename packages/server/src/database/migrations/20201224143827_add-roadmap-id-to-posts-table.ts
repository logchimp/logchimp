import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("posts", (table) => {
      table
        .uuid("roadmap_id")
        .references("id")
        .inTable("roadmaps")
        .onDelete("set null");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Add column: roadmap_id in posts",
    });
  } catch (err) {
    logger.error({
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("posts", (table) => {
      table.dropColumn("roadmap_id");
    });

    logger.info({
      message: "Drop column: roadmap_id in posts",
    });
  } catch (err) {
    logger.error({
      message: err,
    });
    throw err;
  }
}
