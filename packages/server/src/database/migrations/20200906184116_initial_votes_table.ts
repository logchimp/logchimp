import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("votes", (table) => {
      table.uuid("voteId").notNullable().unique().primary();
      table.uuid("userId").references("userId").inTable("users").notNullable();
      table
        .uuid("postId")
        .references("postId")
        .inTable("posts")
        .onDelete("cascade")
        .notNullable();
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing post votes data");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: votes",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating table votes",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasTable("votes");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing table: votes",
      });
      return;
    }

    await knex.schema
      .alterTable("votes", (table) => {
        table.dropForeign("userId");
        table.dropForeign("postId");
      })
      .dropTable("votes");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: votes",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping table votes",
      err,
    });
    throw err;
  }
}
