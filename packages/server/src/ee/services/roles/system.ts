/**
 * This file contains system roles and permissions.
 */

import type { TPermission } from "@logchimp/types";

import { RoleIdService, RolesService } from "../roles.service";
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

const ROLES = [
  {
    id: "f6027b68-6c4f-4331-8354-41836f654980",
    name: "@everyone",
    description: "All users",
    permissions: ["post:create", "vote:create", "vote:destroy"],
  },
  {
    id: "c2d058ec-1913-4ec9-afe8-d6cf11e9d324",
    name: "Manager",
    description: "Managers can manage users, boards, and posts",
    permissions: []
  },
] as Array<{
  id: string; // uuid v4
  name: string;
  description: string;
  permissions: TPermission[];
}>;

export async function seedSystemPermissions() {
  // Permissions
  const permissionService = new PermissionService();
  for (const permission of PERMISSIONS) {
    await permissionService.addPermission(permission);
  }

  // Roles
  const roleService = new RolesService();
  for (const role of ROLES) {
    const roleIdService = new RoleIdService(role.id);
    const roleExists = await roleIdService.getRole();
    if (roleExists) continue;

    const _role = {
      name: role.name,
      description: role.description,
    };
    await roleService.createRoleWithPermissions(_role, role.permissions);
  }

  process.exit(0);
}

seedSystemPermissions();
