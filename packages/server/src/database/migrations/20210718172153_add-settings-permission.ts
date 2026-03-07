import type { Knex } from "knex";
import type { TPermission } from "@logchimp/types";
import { addPermission, removePermission } from "../utils";

const permissions = [
  "settings:read",
  "settings:update",
] satisfies TPermission[];

export async function up(knex: Knex): Promise<void> {
  await Promise.all([addPermission(knex, permissions)]);
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all([removePermission(knex, permissions)]);
}
