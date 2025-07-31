import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function addRoleToUser(req: Request, res: Response) {
  // @ts-ignore
  const permissions = req.user.permissions;
  const { role_id, user_id } = req.params;

  const checkPermission = permissions.find((item) => item === "role:assign");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const response = await database
      .insert({
        id: uuid(),
        role_id,
        user_id,
      })
      .into("roles_users")
      .onConflict(["role_id", "user_id"])
      .ignore();

    // @ts-ignore
    res.status(response.rowCount ? 200 : 204).send({
      // @ts-ignore
      success: response.rowCount,
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
