import type { Knex } from "knex";
import logger from "../../utils/logger";

export async function up(knex: Knex): Promise<void> {
  try {
    // Single-row table (id = 'default') holding the Slack integration settings
    await knex.schema.createTable("slack_settings", (table) => {
      table.string("id", 20).notNullable().primary();
      table.string("notification_channel_id", 50);
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
      table.comment("Storing Slack integration settings");
    });

    // One row per Slack message converted into a post, keeps conversions idempotent
    await knex.schema.createTable("slack_message_imports", (table) => {
      table.uuid("id").notNullable().primary();
      table.string("team_id", 50).notNullable();
      table.string("channel_id", 50).notNullable();
      table.string("message_ts", 50).notNullable();
      table.string("slack_user_id", 50).notNullable();
      table
        .uuid("user_id")
        .references("userId")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .uuid("post_id")
        .references("postId")
        .inTable("posts")
        .onDelete("SET NULL");
      table.string("status", 20).notNullable();
      table.text("error");
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

      table.unique(["team_id", "channel_id", "message_ts"], {
        indexName: "slack_message_imports_message_unique",
      });
      table.comment("Storing Slack messages converted into posts");
    });

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Tables created: slack_settings, slack_message_imports",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error creating Slack integration tables",
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("slack_message_imports");
    await knex.schema.dropTableIfExists("slack_settings");

    logger.info({
      code: "DATABASE_MIGRATIONS",
      message: "Tables dropped: slack_message_imports, slack_settings",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: "Error dropping Slack integration tables",
      err,
    });
    throw err;
  }
}
