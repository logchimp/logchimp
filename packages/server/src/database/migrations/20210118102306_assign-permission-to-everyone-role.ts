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

export async function up(knex: Knex): Promise<void> {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    const permissions =
      await knex("permissions").select<Array<IPermissionDatabaseTable>>();

    await knex
      .insert([
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "post:create"),
        },
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "vote:create"),
        },
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "vote:destroy"),
        },
      ])
      .into("permissions_roles");

    logger.info({
      message: "Insert data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
    throw err;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    await knex("permissions_roles").delete().where({
      role_id: roleId,
    });

    logger.info({
      message: "Drop data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
    throw err;
  }
}
