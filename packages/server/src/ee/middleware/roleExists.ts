import type { NextFunction, Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";
import { RoleIdService } from "../services/roles/roles.service";

type RequestParam =
  | operations["getRoleByID"]["parameters"]["path"]
  | operations["assignRoleToUser"]["parameters"]["path"]
  | operations["unassignRoleFromUser"]["parameters"]["path"];

export async function roleExists(
  req: Request<RequestParam>,
  res: Response<components["schemas"]["GenericAPIErrorResponseBody"]>,
  next: NextFunction,
) {
  const id = validUUID(req.body.id || req.params.role_id);

  if (!id) {
    res.status(400).send({
      message: error.api.roles.invalidRoleId,
      code: "INVALID_ROLE_ID",
    });
    return;
  }

  const roleIdService = new RoleIdService(id);
  const role = await roleIdService.getRole();

  if (!role) {
    res.status(404).send({
      message: error.api.roles.roleNotFound,
      code: "ROLE_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  req.role = role;
  next();
}
