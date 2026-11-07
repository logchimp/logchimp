import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";

import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody =
  | components["schemas"]["GetCustomerByIdResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function getUserInfo(
  req: Request<operations["getCustomerById"]["parameters"]["path"]>,
  res: Response<ResponseBody>,
) {
  const { customer_id } = req.params;

  try {
    const customer = await database<components["schemas"]["CustomerItemInfo"]>(
      "users",
    )
      .select(
        "userId",
        "name",
        "username",
        "email",
        "avatar",
        "isVerified",
        "isBlocked",
        "isOwner",
        "notes",
        "createdAt",
      )
      .where({
        userId: customer_id,
      })
      .first();

    res.status(200).send({
      customer,
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
