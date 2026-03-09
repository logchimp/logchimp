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
    logger.error(err);
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const exists = await knex.schema.hasTable("resetPassword");
    if (!exists) {
      logger.warn({
        code: "DATABASE_MIGRATIONS",
        message: "Skipping drop for missing table: resetPassword",
      });
      return;
    }

    await knex.schema.dropTable("resetPassword");
    logger.info({
      message: "Table dropped: resetPassword",
    });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}
