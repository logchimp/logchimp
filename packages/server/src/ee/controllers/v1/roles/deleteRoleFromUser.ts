import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function deleteRoleFromUser(
  req: Request<operations["unassignRoleFromUser"]["parameters"]["path"]>,
  res: Response<components["schemas"]["GenericAPIErrorResponseBody"]>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  const { role_id, user_id } = req.params;

  const checkPermission = permissions.find((item) => item === "role:unassign");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    await database.delete().from("roles_users").where({
      role_id,
      user_id,
    });

    res.sendStatus(204);
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
