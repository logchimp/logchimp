import type { Request, Response } from "express";

// database
import database from "../../../database";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";

export async function validate(req: Request, res: Response) {
  // @ts-ignore
  const { isVerified } = req.user;
  // @ts-ignore
  const { email } = req.emailToken;

  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
    const verifyUser = await database
      .update({
        isVerified: true,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
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
