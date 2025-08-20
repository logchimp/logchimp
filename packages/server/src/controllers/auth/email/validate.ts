import type { Response } from "express";
import type {
  IApiErrorResponse,
  IValidateEmailVerificationTokenRequestBody,
  IValidateEmailVerificationTokenResponseBody,
} from "@logchimp/types";

// database
import database from "../../../database";

// utils
import type { ExpressRequestContext } from "../../../express";
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";

type ResponseBody =
  | IValidateEmailVerificationTokenResponseBody
  | IApiErrorResponse;

export async function validate(
  req: ExpressRequestContext<
    unknown,
    unknown,
    IValidateEmailVerificationTokenRequestBody
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const { isVerified } = req.user;
  const { email } = req.ctx.token;

  if (isDomainBlacklisted(email)) {
    return res.status(403).send({
      message: "Email domain is not allowed.",
      code: "EMAIL_DOMAIN_BLACKLISTED",
    });
  }

  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
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
