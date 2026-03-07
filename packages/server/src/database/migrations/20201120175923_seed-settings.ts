import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex("settings").insert([
      {
        title: "LogChimp",
        description: "Track user feedback to build better products",
        accentColor: "484d7c",
        logo: "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png",
        icon: "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png",
        isPoweredBy: true,
      },
    ]);

    logger.info({
      code: "DATABASE_SEEDS",
      message: "Insert data: settings",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      err,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex("settings").delete();

    logger.info({
      message: "Drop data: settings",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      err,
    });
  }
}
