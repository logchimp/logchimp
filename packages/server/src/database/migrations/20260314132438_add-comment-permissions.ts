import type { Knex } from "knex";
import type { TPermission } from "@logchimp/types";

import { addPermission, removePermission } from "../utils";
import logger from "../../utils/logger";

const permissions: TPermission[] = [
  "comment:update:own",
  "comment:update:any",
  "comment:delete:own",
  "comment:delete:any",
  "comment:view_internal",
];

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
