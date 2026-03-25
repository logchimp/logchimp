import type {
  IRole,
  IUpdateRoleRequestBody,
  TPermission,
} from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";

import database from "../../../database";
import { rawPermissionArrayQuery } from "../../../middlewares/auth/helpers";
import { PermissionService } from "./permission.service";
import logger from "../../../utils/logger";
import { ValidationError } from "../../../utils/error";

interface CreateRoleArgs {
  id?: string;
  name: string;
  description?: string;
}

export interface IRoleTableColumns {
  id: string;
  name: string;
  description: string | null;
  is_system: number;
  created_at: Date;
  updated_at: Date;
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
      .returning<IRoleTableColumns[]>([
        "id",
        "name",
        "description",
        "is_system",
        "created_at",
        "updated_at",
      ]);

    if (!res.length) return null;

    const role = res[0];
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: !!role.is_system,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
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
        throw new ValidationError(
          `Unknown permission: ${permissionStr}`,
          "INVALID_PERMISSION",
        );
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

  async getRole(): Promise<IRole | null> {
    const role = await database
      .select<IRoleTableColumns>(
        "id",
        "name",
        "description",
        "is_system",
        "created_at",
        "updated_at",
      )
      .from("roles")
      .where({
        id: this.roleId,
      })
      .first();

    if (!role) return null;
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: !!role.is_system,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }

  async updateRole(
    _role: Omit<IUpdateRoleRequestBody, "id" | "permissions">,
  ): Promise<IRole | null> {
    const res = await database
      .update({
        name: _role.name,
        description: _role.description,
        updated_at: new Date().toJSON(),
      })
      .from("roles")
      .where({
        id: this.roleId,
      })
      .returning<IRoleTableColumns[]>([
        "id",
        "name",
        "description",
        "is_system",
        "created_at",
        "updated_at",
      ]);

    if (!res.length) return null;
    const role = res[0];
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: !!role.is_system,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }

  /**
   * Update permissions for a role
   * @param permissions
   */
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
          throw new ValidationError(
            `Unknown permission: ${permissionStr}`,
            "INVALID_PERMISSION",
          );
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
