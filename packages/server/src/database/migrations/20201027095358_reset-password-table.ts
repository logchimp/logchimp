import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "resetPassword",
      (table: Knex.CreateTableBuilder) => {
        table
          .string("email", 320)
          .notNullable()
          .unique()
          .primary()
          .references("email")
          .inTable("users")
          .onDelete("cascade");
        table.string("token", 320).notNullable().unique();
        table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
      },
    );

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: resetPassword",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("resetPassword");
    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: resetPassword",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
