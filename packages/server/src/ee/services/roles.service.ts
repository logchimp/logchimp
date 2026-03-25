import type {
  IRole,
  IUpdateRoleRequestBody,
  TPermission,
} from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";

import database from "../../database";
import { rawPermissionArrayQuery } from "../../middlewares/auth/helpers";
import { PermissionService } from "./roles/permission.service";
import logger from "../../utils/logger";

interface CreateRoleArgs {
  id?: string;
  name: string;
  description?: string;
}

interface IRolePermissionsTableColumns {
  id: string;
  permission_id: string;
  role_id: string;
}

export class RolesService {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async create() {
    const res = await database
      .insert({
        id: uuidv4(),
        name: "new role",
      })
      .into("roles")
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

  async createRoleWithPermissions(
    role: CreateRoleArgs,
    permissions: TPermission[],
    options?: {
      isSystem?: number;
      enableLogging?: boolean;
    },
  ) {
    await this.permissionService.load();

    const roleId = role?.id ?? uuidv4();

    const rows: IRolePermissionsTableColumns[] = [];
    for (const permission of permissions) {
      const permissionStr = (permission || "").trim();
      if (!permissionStr) continue;

      const permissionId =
        this.permissionService.permissionRefs.get(permissionStr);
      if (!permissionId) {
        throw new Error(`Unknown permission: ${permissionStr}`);
      }

      rows.push({
        id: uuidv4(),
        permission_id: permissionId,
        role_id: roleId,
      });
    }

    await database.transaction(async (trx) => {
      await trx("roles").insert({
        id: roleId,
        name: role.name,
        description: role.description,
        is_system: options?.isSystem ?? 0,
      });

      if (rows.length === 0) {
        return;
      }
      await trx("permissions_roles").insert(rows);
    });

    if (options && options?.enableLogging) {
      logger.info(
        `Role created: ${role.name} with permissions: ${permissions.join(", ")}`,
      );
    }
  }
}

export class RoleIdService {
  private readonly roleId: string;
  private permissionService: PermissionService;

  constructor(roleId: string) {
    this.roleId = roleId;
    this.permissionService = new PermissionService();
  }

  get getRoleId() {
    return this.roleId;
  }

  async getRole() {
    return database
      .select<IRole>("id", "name", "description", "created_at", "updated_at")
      .from("roles")
      .where({
        id: this.roleId,
      })
      .first();
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
    await this.permissionService.load();

    await database.transaction(async (trx) => {
      // delete all existing permissions for a role
      await trx.delete().from("permissions_roles").where({
        role_id: this.roleId,
      });

      if (permissions.length === 0) {
        return;
      }

      const rows: IRolePermissionsTableColumns[] = [];
      for (const permission of permissions) {
        const permissionStr = (permission || "").trim();
        if (!permissionStr) continue;

        const permissionId =
          this.permissionService.permissionRefs.get(permissionStr);
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
}
