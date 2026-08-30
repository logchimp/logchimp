import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("auth_identities", (t) => {
      t.string("id").primary();
      t.uuid("user_id")
        .notNullable()
        .references("userId")
        .inTable("users")
        .onDelete("CASCADE");
      t.string("provider").notNullable();
      t.string("subject").notNullable();
      t.string("email").notNullable();
      t.boolean("email_verified").notNullable().defaultTo(false);
      t.dateTime("updated_at");
      t.dateTime("created_at").notNullable().defaultTo(knex.fn.now());

      t.unique(["provider", "subject"], {
        indexName: "auth_identities_provider_subject_unique",
      });
      t.index(["user_id"], "auth_identities_user_id_idx");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Created 'auth_identities' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Failed to create 'auth_identities' table",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("auth_identities");

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Dropped 'auth_identities' table",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Failed to drop 'auth_identities' table",
      err,
    });
    throw err;
  }
}
