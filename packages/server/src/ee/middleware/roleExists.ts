import type { Request, Response, NextFunction } from "express";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";
import { RoleIdService } from "../services/roles/roles.service";

export async function roleExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = validUUID(req.body.id || req.params.role_id);

  if (!id) {
    return res.status(400).send({
      message: error.api.roles.invalidRoleId,
      code: "INVALID_ROLE_ID",
    });
  }

  const roleIdService = new RoleIdService(id);
  const role = await roleIdService.getRole();

  if (!role) {
    return res.status(404).send({
      message: error.api.roles.roleNotFound,
      code: "ROLE_NOT_FOUND",
    });
  }

  // @ts-expect-error
  req.role = role;
  next();
}
