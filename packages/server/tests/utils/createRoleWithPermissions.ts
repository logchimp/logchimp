import { v4 as uuidv4 } from "uuid";
import database from "../../src/database";

type PermissionInput = {
  type: string;
  action: string;
};

type RoleInput = {
  roleId?: string;
  roleName?: string;
};

export async function createRoleWithPermissions(
  userId: string,
  permissions: PermissionInput[],
  role?: RoleInput,
): Promise<string> {
  const roleId = role?.roleId ?? uuidv4();

  const roleName =
    role?.roleName ??
    permissions.map((p) => `${p.type}:${p.action}`).join(", ");

  await database.transaction(async (trx) => {
    const existingRole = await trx("roles").where({ id: roleId }).first();

    if (!existingRole) {
      await trx("roles").insert({
        id: roleId,
        name: roleName,
        description: `Role with permissions: ${permissions
          .map((p) => `${p.type}:${p.action}`)
          .join(", ")}`,
      });
    }

    for (const { type, action } of permissions) {
      const permission = await trx("permissions")
        .where({ type, action })
        .first();

      if (!permission) {
        throw new Error(`Permission not found: ${type}:${action}`);
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
