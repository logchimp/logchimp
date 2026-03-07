import type { Knex } from "knex";
import { addPermission, removePermission } from "../utils";

const permissions = ["settings:read", "settings:update"];

export async function up(knex: Knex): Promise<void> {
  await Promise.all([addPermission(knex, permissions)]);
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all([removePermission(knex, permissions)]);
}
