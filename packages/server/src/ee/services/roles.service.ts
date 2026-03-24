import type {
  IRole,
  IUpdateRoleRequestBody,
  TPermission,
} from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";

import database from "../../database";
import { rawPermissionArrayQuery } from "../../middlewares/auth/helpers";

interface IPermissionTableColumns {
  id: string;
  name: string | null;
  type: string | null;
  action: string | null;
  scope: string | null;
  created_at: Date;
}

interface IRolePermissionsTableColumns {
  id: string;
  permission_id: string;
  role_id: string;
}

export class RoleIdService {
  private readonly roleId: string;

  constructor(roleId: string) {
    this.roleId = roleId;
  }

  get getRoleId() {
    return this.roleId;
  }

  async updateRole(role: Omit<IUpdateRoleRequestBody, "id" | "permissions">) {
    const res = await database
      .update({
        name: role.name,
        description: role.description,
        updated_at: new Date().toJSON(),
      })
      .from("roles")
      .where({
        id: this.roleId,
      })
      .returning<IRole[]>([
        "id",
        "name",
        "description",
        "created_at",
        "updated_at",
      ]);

    if (!res.length) return null;
    return res[0];
  }

  async updatePermission(permissions: TPermission[]) {
    const systemPermissions = await this.getSystemPermissions();

    await database.transaction(async (trx) => {
      // delete all existing permissions for a role
      await trx.delete().from("permissions_roles").where({
        role_id: this.roleId,
      });

      if (permissions.length === 0) {
        return;
      }

      const permissionMap = new Map<string, string>(
        systemPermissions.map((p) => [
          `${p.type}:${p.action}${p?.scope ? `:${p.scope}` : ""}`,
          p.id,
        ]),
      );

      const rows: IRolePermissionsTableColumns[] = [];
      for (const permission of permissions) {
        const permissionStr = (permission || "").trim();
        if (!permissionStr) continue;

        const permissionId = permissionMap.get(permissionStr);
        if (!permissionId) {
          throw new Error(`Unknown permission: ${permissionStr}`);
        }

        rows.push({
          id: uuidv4(),
          permission_id: permissionId,
          role_id: this.roleId,
        });
      }

      await trx("permissions_roles").insert(rows);
    });
  }

  async getRolePermissions() {
    return database
      .select<{
        permissions: TPermission[] | null;
      }>(rawPermissionArrayQuery)
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": this.roleId,
      })
      .first();
  }

  private async getSystemPermissions() {
    return database.select<IPermissionTableColumns[]>().from("permissions");
  }
}
