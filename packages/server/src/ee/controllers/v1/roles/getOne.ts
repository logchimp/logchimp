import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { RoleIdService } from "../../../services/roles/roles.service";

type ResponseBody =
  | components["schemas"]["GetRoleByIdResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function getOne(
  req: Request<operations["getRoleByID"]["parameters"]["path"]>,
  res: Response<ResponseBody>,
) {
  const id = req.params.role_id;

  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const roleIdService = new RoleIdService(id);

  try {
    // @ts-expect-error
    const role = req?.role as components["schemas"]["RoleItem"];
    const rolePermissions = await roleIdService.getRolePermissions();

    res.status(200).send({
      role: {
        ...role,
        permissions: rolePermissions?.permissions || [],
      },
    });
  } catch (err) {
    logger.error({
      message: "failed to get role in DB",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
