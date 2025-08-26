import type { Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  ISetPasswordRequestBody,
  ISetPasswordResponseBody,
} from "@logchimp/types";
import database from "../../../database";

// utils
import { hashPassword } from "../../../utils/password";
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import type { ExpressRequestContext } from "../../../express";

type ResponseBody =
  | ISetPasswordResponseBody
  | IApiValidationErrorResponse
  | IApiErrorResponse;

export async function set(
  req: ExpressRequestContext<unknown, unknown, ISetPasswordRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const { userId, email } = req.user;
  const { password } = req.body;

  if (!password) {
    return res.status(400).send({
      errors: [
        password
          ? undefined
          : {
              message: error.api.authentication.noPasswordProvided,
              code: "PASSWORD_MISSING",
            },
      ],
    });
  }

  try {
    const hashedPassword = hashPassword(password);

    await database
      .update({
        password: hashedPassword,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        userId,
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
