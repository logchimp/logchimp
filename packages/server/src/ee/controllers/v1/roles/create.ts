import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IRole,
  IApiErrorResponse,
  ICreateRoleResponseBody,
  TPermission,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

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
