import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";
import database from "../../../database";

// utils
import { hashPassword } from "../../../utils/password";
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { getUserByEmail } from "../../../repository/user";

type ResponseBody =
  | components["schemas"]["SetNewPasswordResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function set(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["SetNewPasswordRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  const { password } = req.body;
  // @ts-expect-error
  const email = req.email as string;

  if (!password) {
    res.status(400).send({
      message: "Invalid body parameters",
      code: "VALIDATION_ERROR",
      errors: [
        password
          ? undefined
          : {
              message: error.api.authentication.noPasswordProvided,
              code: "PASSWORD_MISSING",
            },
      ],
    });
    return;
  }

  try {
    const user = await getUserByEmail(database, email);
    if (!user) {
      res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    const hashedPassword = hashPassword(password);

    await database
      .update({
        password: hashedPassword,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        userId: user.userId,
      });

    await database.delete().from("resetPassword").where({
      email,
    });

    res.status(200).send({
      reset: {
        success: true,
      },
    });
  } catch (err) {
    logger.error(err);

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
