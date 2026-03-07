import type { Knex } from "knex";
import type { TPermission } from "@logchimp/types";

import { addPermission, removePermission } from "../utils";

const permissions: TPermission[] = [
  "comment:create",
  "comment:view_internal",
  "comment:create_internal",
  "comment:update",
  "comment:destroy",
];

export async function up(knex: Knex): Promise<void> {
  await Promise.all([addPermission(knex, permissions)]);
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all([removePermission(knex, permissions)]);
}
