import { addPermission, removePermission } from "../utils";

const permissions = ["settings:read", "settings:update"];

exports.up = (knex) => {
  return Promise.all([addPermission(knex, permissions)]);
};

exports.down = (knex) => {
  return Promise.all([removePermission(knex, permissions)]);
};
