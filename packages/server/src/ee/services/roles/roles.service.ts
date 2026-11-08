import type { components } from "@logchimp/api-ts-types";
import { v4 as uuidv4 } from "uuid";

import database from "../../../database";
import { rawPermissionArrayQuery } from "../../../middlewares/auth/helpers";
import { PermissionService } from "./permission.service";
import logger from "../../../utils/logger";
import { ValidationError } from "../../../utils/error";
import { dateToISOString } from "../../../helpers";

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
      .returning([
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
      created_at: dateToISOString(role.created_at),
      updated_at: dateToISOString(role.updated_at),
    };
  }

  async createRoleWithPermissions(
    role: CreateRoleArgs,
    permissions: Array<components["schemas"]["Permission"]>,
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

  async getRole(): Promise<components["schemas"]["RoleItem"] | null> {
    const role = await database
      .select(
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
      created_at: dateToISOString(role.created_at),
      updated_at: dateToISOString(role.updated_at),
    };
  }

  async updateRole(
    _role: Omit<
      components["schemas"]["UpdateRoleRequestBody"],
      "id" | "permissions"
    >,
  ): Promise<components["schemas"]["RoleItem"] | null> {
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
      .returning([
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
      created_at: dateToISOString(role.created_at),
      updated_at: dateToISOString(role.updated_at),
    };
  }

  /**
   * Update permissions for a role
   * @param permissions
   */
  async updatePermission(
    permissions: Array<components["schemas"]["Permission"]>,
  ) {
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
        permissions: Array<components["schemas"]["Permission"]> | null;
      }>(rawPermissionArrayQuery)
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": this.roleId,
      })
      .first();
  }
}
