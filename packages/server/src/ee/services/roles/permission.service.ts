import type { TPermission } from "@logchimp/types";
import { v4 as uuidv4 } from "uuid";

import database from "../../../database";
import logger from "../../../utils/logger";

export interface IPermissionTableColumns {
  id: string;
  name: string | null;
  type: string | null;
  action: string | null;
  scope: string | null;
  created_at: Date;
}

export class PermissionService {
  permissionKey = new Set<string>();
  permissionEntity = new Set<IPermissionTableColumns>();
  permissionRef = new Map<string, string>();

  /**
   * Get all permissions from the database
   */
  async load() {
    this.permissionKey.clear();
    this.permissionEntity.clear();
    this.permissionRef.clear();

    const perms = await database
      .select<IPermissionTableColumns[]>()
      .from("permissions");

    if (!perms || perms.length === 0) return [];

    for (const permission of perms) {
      const key = `${permission.type}:${permission.action}${permission?.scope ? `:${permission.scope}` : ""}`;
      this.permissionKey.add(key);
      this.permissionEntity.add(permission);
      this.permissionRef.set(key, permission.id);
    }
  }

  get permissionEntities() {
    return this.permissionEntity;
  }

  get permissionKeys() {
    return this.permissionKey;
  }

  get permissionRefs() {
    return this.permissionRef;
  }

  /**
   * Add a permission to the database
   * @param {TPermission} permission
   * @param options
   */
  async addPermission(
    permission: TPermission,
    options?: {
      enableLogging?: boolean;
    },
  ) {
    const [type, action, scope] = permission.split(":");

    if (this.permissionKeys.has(permission)) return;

    await database("permissions").insert({
      id: uuidv4(),
      type,
      action,
      ...(scope && {
        scope,
      }),
    });

    if (options && options?.enableLogging) {
      logger.info(`Permission added: ${permission}`);
    }
  }
}
