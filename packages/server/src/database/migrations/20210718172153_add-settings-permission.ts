import type { Knex } from "knex";
import { addPermission, removePermission } from "../utils";

const permissions = ["settings:read", "settings:update"];

exports.up = (knex: Knex) => {
  return Promise.all([addPermission(knex, permissions)]);
};

exports.down = (knex: Knex) => {
  return Promise.all([removePermission(knex, permissions)]);
};
