import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("settings", (table) => {
      table.text("labs").defaultTo("{}");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Insert column 'labs' into settings",
    });

    await knex("settings").update({
      labs: knex.raw("labs::jsonb || '{\"comments\": false}'"),
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Insert 'comments' into labs column",
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
    await knex.schema.table("settings", (table) => {
      table.dropColumn("labs");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Column dropped: 'labs' from settings",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
