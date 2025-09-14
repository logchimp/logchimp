import type { Request, Response, NextFunction } from "express";
import database from "../../database";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

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
    })
  }

  const role = await database
    .select()
    .from("roles")
    .where({
      id: id || null,
    })
    .first();

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
