import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IValidateEmailVerificationTokenRequestBody,
  IValidateEmailVerificationTokenResponseBody,
} from "@logchimp/types";

// database
import database from "../../../database";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { getUserByEmail } from "../../../repository/user";

type ResponseBody =
  | IValidateEmailVerificationTokenResponseBody
  | IApiErrorResponse;

export async function validate(
  req: Request<unknown, unknown, IValidateEmailVerificationTokenRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const { email } = req.token;

  try {
    const user = await getUserByEmail(database, email);
    if (user.isVerified) {
      res.status(409).send({
        message: error.api.emailVerify.emailAlreadyVerified,
        code: "EMAIL_VERIFIED",
      });
      return;
    }

    const verifyUser = await database("users")
      .update({
        isVerified: true,
        updatedAt: new Date().toJSON(),
      })
      .where({
        email,
      })
      .returning("isVerified");

    const isUserVerified = verifyUser[0];
    await database.delete().from("emailVerification").where({ email });

    res.status(200).send({
      verify: {
        success: isUserVerified,
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
