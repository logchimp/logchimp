import { v4 as uuidv4 } from "uuid";
import database from "../../src/database";

type PermissionInput = {
  type: string;
  action: string;
};

export async function createRoleWithPermissions(
  permissions: PermissionInput[],
  roleId?: string,
  userId?: string,
): Promise<string> {
  const finalRoleId = roleId ?? uuidv4();

  await database.transaction(async (trs) => {
    if (!roleId) {
      await trs("roles").insert({
        id: finalRoleId,
        name: permissions.map((p) => `${p.type}:${p.action}`).join(", "),
        description: `Role with permissions: ${permissions
          .map((p) => `${p.type}:${p.action}`)
          .join(", ")}`,
      });
    }

    for (const { type, action } of permissions) {
      const permission = await trs("permissions")
        .where({ type, action })
        .first();

      if (!permission) {
        throw new Error(`Permission not found: ${type}:${action}`);
      }

      await trs("permissions_roles").insert({
        id: uuidv4(),
        role_id: finalRoleId,
        permission_id: permission.id,
      });
    }

    if (userId) {
      await trs("roles_users").insert({
        id: uuidv4(),
        role_id: finalRoleId,
        user_id: userId,
      });
    }
  });

  return finalRoleId;
}
