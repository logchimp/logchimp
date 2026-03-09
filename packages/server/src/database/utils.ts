import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import type { TPermission } from "@logchimp/types";

import logger from "../utils/logger";

interface IPermissionTableColumns {
  id: string;
  name: string | null;
  type: string;
  action: string;
  created_at: Date;
}

interface IPermissionDatabaseTableWhere {
  action: string;
  type: string;
}

const permissionExists = async (
  database: Knex,
  permission: IPermissionDatabaseTableWhere,
) =>
  database
    .select<IPermissionTableColumns>()
    .from("permissions")
    .where({
      ...permission,
    })
    .first();

async function addPermission(
  database: Knex,
  permissions: TPermission[],
): Promise<void> {
  for (const permission of permissions) {
    const [type, action] = permission.split(":");

    const exists = await permissionExists(database, {
      type,
      action,
    });

    if (exists) {
      logger.warn({
        message: `Permission ${type}:${action} already added`,
      });
      continue;
    }

    await database
      .insert({
        id: uuidv4(),
        type,
        action,
      })
      .into("permissions");

    logger.info(`Permission added: ${type}:${action}`);
  }
}

async function removePermission(
  database: Knex,
  permissions: TPermission[],
): Promise<void> {
  for (const permission of permissions) {
    const [type, action] = permission.split(":");

    await database.delete().from("permissions").where({
      type,
      action,
    });

    logger.info(`Permission removed: ${type}:${action}`);
  }
}

export { addPermission, removePermission };
