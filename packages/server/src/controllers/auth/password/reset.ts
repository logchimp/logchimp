import type { Request, Response } from "express";

// services
import { passwordReset as passwordResetEmail } from "../../../services/auth/passwordReset";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { isDevTestEnv } from "../../../helpers";

export async function reset(req: Request, res: Response) {
  // @ts-ignore
  const { userId, email } = req.user;

  try {
    const tokenPayload = {
      userId,
      email,
      type: "resetPassword",
    };
    const passwordReset = await passwordResetEmail(tokenPayload);

    /**
     * sending token as response for
     * development/testing/staging environment
     */
    const __token = isDevTestEnv
      ? {
          ...passwordReset,
        }
      : "";

    res.status(200).send({
      reset: {
        success: passwordReset,
        ...__token,
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
