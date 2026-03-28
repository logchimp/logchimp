/**
 * This file contains system roles and permissions.
 */

import type { TPermission } from "@logchimp/types";

import { RoleIdService, RolesService } from "./roles.service";
import { PermissionService } from "./permission.service";
import logger from "../../../utils/logger";
import { arraysEqual, normalize } from "../../../helpers";

interface ISystemRole {
  id: string; // uuid v4
  name: string;
  description: string;
  permissions: TPermission[];
}

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
  // {
  //   id: "c2d058ec-1913-4ec9-afe8-d6cf11e9d324",
  //   name: "Manager",
  //   description: "Managers can manage users, boards, and posts",
  //   permissions: [],
  // },
] as Array<ISystemRole>;

export async function seedSystemPermissions() {
  const permissionService = new PermissionService();
  await permissionService.load();

  // Permissions
  logger.info("Seeding system permissions...");
  for (const permission of PERMISSIONS) {
    await permissionService.addPermission(permission, {
      enableLogging: true,
    });
  }
  logger.info("System permissions seeded successfully");

  // Roles
  const roleService = new RolesService();
  logger.info("Seeding system roles...");
  for (const role of ROLES) {
    const roleIdService = new RoleIdService(role.id);
    const roleExists = await roleIdService.getRole();

    const _role = {
      id: role.id,
      name: role.name,
      description: role.description,
    };
    if (!roleExists) {
      await roleService.createRoleWithPermissions(_role, role.permissions, {
        isSystem: 1,
        enableLogging: true,
      });
    } else {
      const permissions = await roleIdService.getRolePermissions();

      const roleChanged = hasRoleChanged(
        {
          ...roleExists,
          permissions: permissions.permissions ?? [],
        },
        {
          ..._role,
          permissions: role.permissions,
        },
      );
      if (roleChanged) {
        delete _role.id;
        await Promise.all([
          roleIdService.updateRole(_role),
          roleIdService.updatePermission(role.permissions),
        ]);
        logger.info(`Role '${role.name}' updated successfully`);
      }
    }
  }
  logger.info("System roles seeded successfully");

  logger.info("System roles & permissions seeded successfully");
}

function hasRoleChanged(existing: ISystemRole, incoming: ISystemRole) {
  if (existing.name !== incoming.name) return true;
  if (existing.description !== incoming.description) return true;

  const existingPerms = normalize(existing.permissions);
  const incomingPerms = normalize(incoming.permissions);

  return !arraysEqual(existingPerms, incomingPerms);
}

if (require.main === module) {
  seedSystemPermissions()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Failed to seed system permissions", { err });
      process.exit(1);
    });
}
