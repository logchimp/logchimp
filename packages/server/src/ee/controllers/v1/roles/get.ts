import type { Request, Response } from "express";
import type {
  IRole,
  IApiErrorResponse,
  IGetAllRoles,
  TPermission,
  IGetRolesParams,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import error from "../../../../errorResponse.json";
import logger from "../../../../utils/logger";

type ResponseBody = IGetAllRoles | IApiErrorResponse;

export async function get(
  req: Request<IGetRolesParams>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const roles = await database.select<IRole[]>().from("roles");

    res.status(200).send({ roles });
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
