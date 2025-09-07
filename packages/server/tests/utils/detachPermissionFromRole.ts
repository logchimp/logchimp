import { v4 as uuidv4 } from "uuid";
import database from "../../src/database";
import type { TPermission } from "@logchimp/types";

type RoleInput = {
  roleId?: string;
  roleName?: string;
};

type RollbackInput = {
  roleId?: string;
  permissionId?: string;
};

export async function detachPermissionsFromRole(
  permissions: TPermission[],
  role: RoleInput,
): Promise<() => Promise<void>> {
  const detached: RollbackInput[] = [];
  await database.transaction(async (trx) => {
    if (!role.roleId) {
      const roleId = await trx("roles")
        .where({ name: role.roleName })
        .first()
        .select("id");
      role.roleId = roleId.id;
    }

    for (const perm of permissions) {
      const [type, action] = perm.split(":");

      const permission = await trx("permissions")
        .where({ type, action })
        .first();

      if (!permission) {
        throw new Error(`Permission not found: ${perm}`);
      }

      const deleted = await trx("permissions_roles")
        .where({ role_id: role.roleId, permission_id: permission.id })
        .del();

      if (deleted) {
        detached.push({ roleId: role.roleId, permissionId: permission.id });
      }
    }
  });

  // test rollback feature
  return async () => {
    await database.transaction(async (trx) => {
      for (const { roleId, permissionId } of detached) {
        await trx("permissions_roles").insert({
          id: uuidv4(),
          role_id: roleId,
          permission_id: permissionId,
        });
      }
    });
  };
}
