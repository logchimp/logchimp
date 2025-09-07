import type { TPermission } from "@logchimp/types";
import jwt, { type JwtPayload } from "jsonwebtoken";

import type {
  IAuthenticationMiddlewareUser,
  IAuthenticationTokenPayload,
} from "../../types";
import database from "../../database";

/**
 * Extracts a token from a given authorization header string.
 * The function expects the header to be in the format "Bearer <token>".
 * @param {string | undefined} header - The authorization header string.
 * @returns {string | undefined} - Returns the extracted valid format token from header, otherwise returns undefined.
 */
export const extractTokenFromHeader = (header?: string): string => {
  if (!header || typeof header !== "string") return undefined;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2) return undefined;
  const [scheme, token] = parts;
  if (/^Bearer$/i.test(scheme) && token) {
    return token;
  }
  return undefined;
};

export function verifyJwtAuthToken(
  token: string,
  secretKey: string,
): IAuthenticationTokenPayload {
  return jwt.verify(token, secretKey) as JwtPayload &
    IAuthenticationTokenPayload;
}

export const getUserInfoWithRoles = async (
  userId: string,
): Promise<IAuthenticationMiddlewareUser> =>
  database
    .select(
      "u.userId",
      "u.isOwner",
      "u.isBlocked",
      "u.name",
      "u.username",
      "u.email",
      database.raw("ARRAY_AGG(r.id) AS roles"),
    )
    .from("users AS u")
    .leftJoin("roles_users AS ru", "u.userId", "ru.user_id")
    .leftJoin("roles AS r", "ru.role_id", "r.id")
    .groupBy("u.userId")
    .where("u.userId", userId)
    .first();

export const computePermissions = async (
  user: IAuthenticationMiddlewareUser,
): Promise<TPermission[]> => {
  // return all permission for owner
  if (user.isOwner) {
    const perms = (await database("permissions AS p")
      .select(
        database.raw(
          "COALESCE( ARRAY_AGG(CONCAT(p.type, ':', p.action)), '{}') AS permissions",
        ),
      )
      .first()) as unknown as { permissions: TPermission[] };

    return perms.permissions;
  }

  // get permissions for roles
  const roles = user.roles || [];
  if (roles.length === 0) return [];
  const perms = (await database
    .select(
      database.raw(
        "COALESCE( ARRAY_AGG( DISTINCT( CONCAT( p.type, ':', p.action))), '{}') AS permissions",
      ),
    )
    .from("roles")
    .innerJoin("permissions_roles", "roles.id", "permissions_roles.role_id")
    .innerJoin("permissions AS p", "permissions_roles.permission_id", "p.id")
    .whereIn("roles.id", roles)
    .first()) as unknown as { permissions: TPermission[] };

  return perms.permissions;
};
