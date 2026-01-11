import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import type {
  IApiErrorResponse,
  IAssignRoleToUserRequestParams,
  IUserRole,
  TAssignRoleToUserResponseBody,
  TPermission,
} from "@logchimp/types";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = TAssignRoleToUserResponseBody | IApiErrorResponse;

export async function addRoleToUser(
  req: Request<IAssignRoleToUserRequestParams>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  const { role_id, user_id } = req.params;

  const checkPermission = permissions.find((item) => item === "role:assign");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    const response = await insertRoleUserWithTrx(user_id, role_id);
    const data = response[0];

    res.status(200).send({
      success: 1,
      ...data,
    });
  } catch (err) {
    if (err.message === "ROLE_USER_CONFLICT") {
      res.status(409).send({
        success: 0,
      });
      return;
    }

    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}

interface IInsertedRoleUser {
  id: string;
  role_id: string;
  user_id: string;
}

/**
 * Inserts a new role-user into the "roles_users" database table and
 * retrieves the associated role details.
 * @param {string} user_id
 * @param {string} role_id
 * @returns {Promise<IUserRole[]>}
 */
const insertRoleUserWithTrx = async (user_id: string, role_id: string) =>
  database.transaction(async (trx): Promise<IUserRole[]> => {
    const insertResponse = await trx<IInsertedRoleUser>("roles_users")
      .insert({
        id: uuid(),
        role_id,
        user_id,
      })
      .onConflict(["role_id", "user_id"])
      .ignore()
      .returning(["id", "role_id"]);

    if (insertResponse.length === 0) {
      throw new Error("ROLE_USER_CONFLICT");
    }

    const insertedData = insertResponse[0];

    return trx<IUserRole>("roles_users")
      .select(
        "roles.id as id",
        "roles.name as name",
        "roles_users.id as user_role_id",
      )
      .innerJoin("roles", "roles.id", "roles_users.role_id")
      .where({
        "roles_users.id": insertedData.id,
      });
  });
