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
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.hasTable("votes").then(async (exists) => {
      if (exists) {
        await knex.schema
          .alterTable("votes", (table) => {
            table.dropForeign("userId");
            table.dropForeign("postId");
          })
          .dropTable("votes");
      }
    });

    logger.log({
      level: "info",
      message: "Table dropped: votes",
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
    throw err;
  }
}
