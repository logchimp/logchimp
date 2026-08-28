import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.alterTable("users", (t) => {
      t.setNullable("password");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Change 'password' column to nullable in 'users' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message:
        "Failed to change 'password' column to nullable in 'users' table",
      error: err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const userWithoutPassword = await knex("users")
      .whereNull("password")
      .first("userId");

    if (userWithoutPassword) {
      throw new Error(
        "Cannot restore NOT NULL on users.password while users without passwords exist.",
      );
    }

    await knex.schema.alterTable("users", (t) => {
      t.dropNullable("password");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Change 'password' column not nullable in 'users' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message:
        "Failed to change 'password' column not nullable in 'users' table",
      error: err,
    });
    throw err;
  }
}
