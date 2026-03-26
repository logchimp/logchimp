// utils
import logger from "../../utils/logger";

exports.up = (knex) => {
  return knex.schema
    .alterTable("permissions", (table) => {
      table.unique(["type", "action"], {
        indexName: "permissions_type_action_unique",
      });
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message:
          "Added composite unique constraint on permissions(type, action)",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable("permissions", (table) => {
      table.dropUnique(["type", "action"], "permissions_type_action_unique");
    })
    .then(() => {
      logger.info({
        code: "DATABASE_MIGRATIONS",
        message:
          "Dropped composite unique constraint on permissions(type, action)",
      });
    })
    .catch((err) => {
      logger.error(err);
    });
};
