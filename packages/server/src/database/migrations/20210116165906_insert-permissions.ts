import type { Knex } from "knex";
import type { TPermission } from "@logchimp/types";

import { addPermission, removePermission } from "../utils";
import logger from "../../utils/logger";

const permissions = [
  "post:read",
  "post:create",
  "post:update",
  "post:destroy",
  "board:read",
  "board:create",
  "board:update",
  "board:destroy",
  "board:assign",
  "board:unassign",
  "vote:create",
  "vote:destroy",
  "vote:assign",
  "vote:unassign",
  "roadmap:read",
  "roadmap:create",
  "roadmap:update",
  "roadmap:destroy",
  "roadmap:assign",
  "roadmap:unassign",
  "dashboard:read",
  "role:read",
  "role:create",
  "role:update",
  "role:destroy",
  "role:assign",
  "role:unassign",
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
