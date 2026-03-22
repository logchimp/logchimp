import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import type { TPermission } from "@logchimp/types";

import logger from "../utils/logger";

interface IPermissionTableColumns {
  id: string;
  name: string | null;
  type: string;
  action: string;
  scope: string | null;
  created_at: Date;
}

interface IPermissionDatabaseTableWhere {
  action: string;
  type: string;
  scope?: string;
}

const permissionExists = async (
  database: Knex,
  permission: IPermissionDatabaseTableWhere,
) =>
  database
    .select<IPermissionTableColumns>()
    .from("permissions")
    .where({
      action: permission.action,
      type: permission.type,
      ...(permission.scope && {
        scope: permission.scope,
      }),
    })
    .first();

async function addPermission(
  database: Knex,
  permissions: TPermission[],
): Promise<void> {
  for (const permission of permissions) {
    const [type, action, scope] = permission.split(":");

    const exists = await permissionExists(database, {
      type,
      action,
      scope,
    });

    if (exists) {
      logger.warn({
        message: `Permission ${type}:${action}${scope ? `:${scope}` : ""} already added`,
      });
      continue;
    }

    await database
      .insert({
        id: uuidv4(),
        type,
        action,
        ...(scope && {
          scope,
        }),
      })
      .into("permissions");

    logger.info(`Permission added: ${type}:${action}${scope ? `:${scope}` : ""}`);
  }
}

async function removePermission(
  database: Knex,
  permissions: TPermission[],
): Promise<void> {
  for (const permission of permissions) {
    const [type, action, scope] = permission.split(":");

    await database
      .delete()
      .from("permissions")
      .where({
        type,
        action,
        ...(scope && {
          scope,
        }),
      });

    logger.info(
      `Permission removed: ${type}:${action}${scope ? `:${scope}` : ""}`,
    );
  }
}

export { addPermission, removePermission };
