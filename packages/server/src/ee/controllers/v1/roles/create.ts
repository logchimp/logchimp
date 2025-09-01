import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IRole,
  IApiErrorResponse,
  ICreateRoleResponseBody,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = ICreateRoleResponseBody | IApiErrorResponse;

export async function create(req: Request, res: Response<ResponseBody>) {
  // @ts-ignore
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("role:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const createRole = await database
      .insert({
        id: uuidv4(),
        name: "new role",
      })
      .into("roles")
      .returning<IRole[]>("*");

    const role = createRole[0];

    res.status(201).send({
      role,
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
