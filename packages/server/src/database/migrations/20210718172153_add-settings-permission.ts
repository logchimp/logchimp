import type { Knex } from "knex";
import type { components } from "@logchimp/api-ts-types";

import { addPermission, removePermission } from "../utils";
import logger from "../../utils/logger";

const permissions = ["settings:read", "settings:update"] satisfies Array<
  components["schemas"]["Permission"]
>;

export async function up(knex: Knex): Promise<void> {
  try {
    await Promise.all([addPermission(knex, permissions)]);
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: `Error adding permissions: ${permissions.join(",")}`,
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await Promise.all([removePermission(knex, permissions)]);
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      message: `Error removing permissions: ${permissions.join(",")}`,
      err,
    });
    throw err;
  }
}
