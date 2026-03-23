import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRole,
  IUpdateRoleRequestBody,
  IUpdateRoleResponseBody,
  TPermission,
} from "@logchimp/types";

// utils
import error from "../../../../errorResponse.json";
import logger from "../../../../utils/logger";
import { RoleIdService } from "../../../services/roles.service";

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

  const roleIdService = new RoleIdService(role.id);

  let updatedRole: IRole | null;
  try {
    updatedRole = await roleIdService.updateRole({
      name: req.body.name,
      description: req.body.description,
    });
  } catch (err) {
    logger.error({
      message: "failed to update role in DB",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return;
  }

  if (!updatedRole) {
    res.status(404).send({
      message: error.api.roles.roleNotFound,
      code: "ROLE_NOT_FOUND",
    });
    return;
  }

  try {
    await roleIdService.updatePermission(role?.permissions || []);
    const updatedPermissions = await roleIdService.getPermissions();

    res.status(200).send({
      role: updatedRole,
      permissions: updatedPermissions?.permissions || [],
    });
  } catch (err) {
    logger.error({
      message: "failed to update role permissions in DB",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
