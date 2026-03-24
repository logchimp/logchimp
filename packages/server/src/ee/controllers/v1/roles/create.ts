import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ICreateRoleResponseBody,
  TPermission,
} from "@logchimp/types";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { RolesService } from "../../../services/roles.service";

type ResponseBody = ICreateRoleResponseBody | IApiErrorResponse;

export async function create(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("role:create");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const rolesService = new RolesService();

  try {
    const role = await rolesService.create();
    if (!role) {
      throw new Error("failed to create role in DB");
    }

    res.status(201).send({
      role,
    });
  } catch (err) {
    logger.error({
      message: "failed to create role in DB",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
