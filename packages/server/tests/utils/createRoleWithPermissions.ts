import { v4 as uuidv4 } from "uuid";
import database from "../../src/database";
import type { TPermission } from "@logchimp/types";

type RoleInput = {
  roleId?: string;
  roleName?: string;
};

export async function createRoleWithPermissions(
  userId: string,
  permissions: TPermission[],
  role?: RoleInput,
): Promise<string> {
  const roleId = role?.roleId ?? uuidv4();

  const roleName = (role?.roleName ?? permissions.join(", ")).slice(0, 30);

  await database.transaction(async (trx) => {
    const existingRole = await trx("roles").where({ id: roleId }).first();

    if (!existingRole) {
      await trx("roles").insert({
        id: roleId,
        name: roleName,
        description: `Role with permissions: ${permissions.join(", ").slice(0, 25)}`,
      });
    }

    for (const perm of permissions) {
      const [type, action] = perm.split(":");

      const permission = await trx("permissions")
        .where({ type, action })
        .first();

      if (!permission) {
        throw new Error(`Permission not found: ${perm}`);
      }

      await trx("permissions_roles").insert({
        id: uuidv4(),
        role_id: roleId,
        permission_id: permission.id,
      });
    }

    if (userId) {
      await trx("roles_users").insert({
        id: uuidv4(),
        role_id: roleId,
        user_id: userId,
      });
    }
  });

  return roleId;
}
