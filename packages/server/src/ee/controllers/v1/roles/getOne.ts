import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetRoleByIdRequestParams,
  IGetRoleByIdResponseBody,
  TPermission,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = IGetRoleByIdResponseBody | IApiErrorResponse;

export async function getOne(
  req: Request<IGetRoleByIdRequestParams>,
  res: Response<ResponseBody>,
) {
  const id = req.params.role_id;

  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const checkPermission = permissions.includes("role:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    const role = await database
      .select()
      .from("roles")
      .where({
        id,
      })
      .first();

    const permissions = (await database
      .select(
        database.raw("ARRAY_AGG(CONCAT(p.type, ':', p.action)) AS permissions"),
      )
      .from("permissions_roles AS pr")
      .leftJoin("permissions AS p", "pr.permission_id", "p.id")
      .where({
        "pr.role_id": role.id,
      })
      .first()) as unknown as { permissions: string[] | null };

    if (!role) {
      res.status(404).send({
        message: error.api.roles.roleNotFound,
        code: "ROLE_NOT_FOUND",
      });
      return;
    }

    res.status(200).send({
      role: {
        ...role,
        permissions: permissions.permissions || [],
      },
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
