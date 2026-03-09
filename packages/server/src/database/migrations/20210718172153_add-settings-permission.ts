import type { Knex } from "knex";
import type { TPermission } from "@logchimp/types";

import { addPermission, removePermission } from "../utils";
import logger from "../../utils/logger";

const permissions = [
  "settings:read",
  "settings:update",
] satisfies TPermission[];

export async function up(knex: Knex): Promise<void> {
  try {
    await Promise.all([addPermission(knex, permissions)]);
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
    await Promise.all([removePermission(knex, permissions)]);
  } catch (err) {
    logger.error({
      code: "DATABASE_MIGRATIONS",
      err,
    });
    throw err;
  }
}
