import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import type { TPermission } from "@logchimp/types";

import logger from "../utils/logger";

interface IPermissionDatabaseTableWhere {
  action: string;
  type: string;
}

const permissionExists = async (
  database: Knex,
  permission: IPermissionDatabaseTableWhere,
) =>
  database
    .select()
    .from("permissions")
    .where({
      ...permission,
    })
    .first();

function addPermission(database: Knex, permissions: TPermission[]) {
  return permissions.forEach(async (permission) => {
    const type = permission.split(":")[0];
    const action = permission.split(":")[1];

    const exists = await permissionExists(database, {
      type,
      action,
    });

    if (exists) {
      return logger.warn({
        message: `Permission ${type}:${action} already added`,
      });
    }

    await database
      .insert({
        id: uuidv4(),
        type,
        action,
      })
      .into("permissions");

    logger.info(`Permission added: ${type}:${action}`);
  });
}

async function removePermission(database: Knex, permissions: TPermission[]) {
  return permissions.forEach(async (permission) => {
    const type = permission.split(":")[0];
    const action = permission.split(":")[1];

    await database.delete().from("permissions").where({
      type,
      action,
    });

    logger.info(`Permission removed: ${type}:${action}`);
  });
}

export { addPermission, removePermission };
