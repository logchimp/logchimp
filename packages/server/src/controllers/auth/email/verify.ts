import type { Request, Response } from "express";

// services
import { verifyEmail } from "../../../services/auth/verifyEmail";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";

export async function verify(req: Request, res: Response) {
  // @ts-ignore
  const { userId, email, isVerified } = req.user;

  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
    const tokenPayload = {
      userId,
      email,
      type: "emailVerification",
    };
    const url = req.headers.origin;
    const emailVerification = await verifyEmail(url, tokenPayload);

    /**
     * sending token as response is for
     * development/testing environment
     */
    const __token =
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "testing" ||
      process.env.NODE_ENV === "ci"
        ? {
            ...emailVerification,
          }
        : "";

    res.status(200).send({
      verify: {
        success: Boolean(emailVerification.createdAt),
        __token,
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
