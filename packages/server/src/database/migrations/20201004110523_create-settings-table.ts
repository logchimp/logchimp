import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("settings", (table) => {
      table.string("title");
      table.string("description");
      table.string("logo");
      table.string("icon");
      table.string("accentColor", 6);
      table.string("googleAnalyticsId");
      table.boolean("isPoweredBy").defaultTo(true);
      table.boolean("allowSignup").defaultTo(true);
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table created: settings",
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
    const exists = await knex.schema.hasTable("settings");
    if (exists) {
      await knex.schema.dropTable("settings");
    }

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Table dropped: settings",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
