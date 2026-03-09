import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex
      .insert([
        {
          id: uuidv4(),
          name: "@everyone",
          description: "All users",
        },
      ])
      .into("roles");

    logger.info({
      code: "DATABASE_SEEDS",
      message: "Insert data: '@everyone' role",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex("roles").delete().where({
      name: "@everyone",
    });

    logger.info({
      code: "DATABASE_SEEDS",
      message: "Drop data: '@everyone' role",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
    throw err;
  }
}
