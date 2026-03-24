/**
 * This file contains system roles and permissions.
 */

import type { TPermission } from "@logchimp/types";

import { PermissionService } from "./permission.service";

const PERMISSIONS = [
  "post:read",
  "post:create",
  "post:update",
  "post:destroy",
  "board:read",
  "board:create",
  "board:update",
  "board:destroy",
  "board:assign",
  "board:unassign",
  "vote:create",
  "vote:destroy",
  "vote:assign",
  "vote:unassign",
  "roadmap:read",
  "roadmap:create",
  "roadmap:update",
  "roadmap:destroy",
  "roadmap:assign",
  "roadmap:unassign",
  "dashboard:read",
  "role:read",
  "role:create",
  "role:update",
  "role:destroy",
  "role:assign",
  "role:unassign",
  "settings:read",
  "settings:update",
  "comment:create",
  "comment:create_internal",
  "comment:update:own",
  "comment:update:any",
  "comment:delete:own",
  "comment:delete:any",
  "comment:view_internal",
] satisfies TPermission[];

export async function seedSystemPermissions() {
  // Permissions
  const permissionService = new PermissionService();
  for (const permission of PERMISSIONS) {
    await permissionService.addPermission(permission);
  }

  process.exit(0);
}

seedSystemPermissions();
