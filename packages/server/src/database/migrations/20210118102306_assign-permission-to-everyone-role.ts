import type { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import type { TPermission } from "@logchimp/types";

import logger from "../../utils/logger";

const everyoneRole = async (knex: Knex) =>
  knex("roles")
    .select<{
      id: string;
    }>("id")
    .where({
      name: "@everyone",
    })
    .first();

interface IPermissionDatabaseTable {
  id: string;
  name: string | null;
  type: string;
  action: string;
  created_at: Date;
}

const getPermId = (
  list: Array<IPermissionDatabaseTable>,
  perm: TPermission,
) => {
  const type = perm.split(":")[0];
  const action = perm.split(":")[1];
  return list.find((item) => item.type === type && item.action === action).id;
};

const EVERYONE_PERMISSIONS: readonly TPermission[] = [
  "post:create",
  "vote:create",
  "vote:destroy",
];

export async function up(knex: Knex): Promise<void> {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    const permissions =
      await knex("permissions").select<Array<IPermissionDatabaseTable>>();

    await knex("permissions_roles").insert(
      EVERYONE_PERMISSIONS.map((permission) => ({
        id: uuidv4(),
        role_id: roleId,
        permission_id: getPermId(permissions, permission),
      })),
    );

    logger.info({
      code: "DATABASE_SEEDS",
      message: "Insert data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: 'Error assigning permissions to @everyone role',
      err,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    const permissions =
      await knex("permissions").select<Array<IPermissionDatabaseTable>>();

    const permissionIds = EVERYONE_PERMISSIONS.map((permission) =>
      getPermId(permissions, permission),
    );

    await knex("permissions_roles")
      .where({ role_id: roleId })
      .whereIn("permission_id", permissionIds)
      .delete();

    logger.info({
      code: "DATABASE_SEEDS",
      message: "Drop data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: 'Error dropping permissions for @everyone role',
      err,
    });
    throw err;
  }
}
