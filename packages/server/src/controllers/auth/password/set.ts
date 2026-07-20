import type { Request, Response } from "express";
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
import { getUserByEmail } from "../../../repository/user";

type ResponseBody =
  | ISetPasswordResponseBody
  | IApiValidationErrorResponse
  | IApiErrorResponse;

export async function set(
  req: Request<unknown, unknown, ISetPasswordRequestBody>,
  res: Response<ResponseBody>,
) {
  const { password } = req.body;
  // @ts-expect-error
  const email = req.email as string;

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
    const user = await getUserByEmail(database, email);

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
