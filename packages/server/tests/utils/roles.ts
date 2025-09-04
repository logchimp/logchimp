import database from "../../src/database";

// ====================
// This file contains different utils functions
// related to roles, like:
// - createRoleWithPermissions
// - removeRoleFromUserId
// ====================

interface RemoveRoleFromUserIdArgs {
  userId: string;
  role: {
    id?: string;
    name?: string;
  };
}

export async function removeRoleFromUserId(
  userId: string,
  role: RemoveRoleFromUserIdArgs["role"],
): Promise<void> {
  let roleId = role.id;

  if (!roleId && role?.name) {
    const getId = await database
      .select("id")
      .from("roles")
      .where({ name: role.name })
      .first();
    roleId = getId.id;
  }

  if (!roleId) return;

  await database("roles_users").del().where({
    user_id: userId,
    role_id: roleId,
  });
}
