import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  IRole,
  IUpdateRoleRequestBody,
  IUpdateRoleResponseBody,
  TPermission,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import error from "../../../../errorResponse.json";
import logger from "../../../../utils/logger";

type ResponseBody = IUpdateRoleResponseBody | IApiErrorResponse;

export async function update(
  req: Request<unknown, unknown, IUpdateRoleRequestBody>,
  res: Response<ResponseBody>,
) {
  const role = req.body;

  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("role:update");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    const existingPermissions = await database.select().from("permissions");

    // delete all existing permissions for a role
    await database.delete().from("permissions_roles").where({
      role_id: role.id,
    });

    const updateRoles = (await database
      .update({
        name: role.name,
        description: role.description,
        updated_at: new Date().toJSON(),
      })
      .from("roles")
      .where({
        id: role.id,
      })
      .returning("*")) as IRole[];

    const updateRole = updateRoles?.[0];

    // add new permissions to the role
    for (const perm of (role?.permissions || []) as TPermission[]) {
      const type = perm.split(":")[0];
      const action = perm.split(":")[1];

      const findPermission = existingPermissions.find(
        (item) => item.type === type && item.action === action,
      );

      await database
        .insert({
          id: uuidv4(),
          permission_id: findPermission.id,
          role_id: role.id,
        })
        .into("permissions_roles");
    }

    const updatedPermissions = (await database
      .select(
        database.raw("ARRAY_AGG(CONCAT(p.type, ':', p.action)) AS permissions"),
      )
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": role.id,
      })
      .first()) as unknown as { permissions: TPermission[] | null };

    res.status(200).send({
      role: updateRole,
      permissions: updatedPermissions?.permissions || [],
    });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
