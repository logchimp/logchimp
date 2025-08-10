import database from "../database";

export const computePermissions = async (user) => {
  if (user.isOwner) {
    const perms = await database
      .select(
        database.raw(
          "COALESCE(ARRAY_AGG(CONCAT(p.type, ':', p.action)), '{}') AS permissions",
        ),
      )
      .from("permissions AS p")
      .first();
    //@ts-ignore
    return perms.permissions;
  }

  const roles = user.roles || [];

  if (roles.length === 0) {
    return [];
  }

  const perms = await database
    .select(
      database.raw(
        "COALESCE(ARRAY_AGG(DISTINCT(CONCAT(p.type, ':', p.action))), '{}') AS permissions",
      ),
    )
    .from("roles")
    .innerJoin("permissions_roles", "roles.id", "permissions_roles.role_id")
    .innerJoin("permissions AS p", "permissions_roles.permission_id", "p.id")
    .whereIn("roles.id", roles)
    .first();
  //@ts-ignore
  return perms.permissions;
};
