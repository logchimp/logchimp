import type { Request, Response } from "express";
import type {
  IAuthPasswordResetResponseBody,
  IApiErrorResponse,
} from "@logchimp/types";

// services
import { passwordReset as passwordResetEmail } from "../../../services/auth/passwordReset";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { isDevTestEnv } from "../../../helpers";
import type { IPasswordResetJwtPayload } from "../../../types";

type ResponseBody = IAuthPasswordResetResponseBody | IApiErrorResponse;

export async function reset(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const { userId, email } = req.user;

  try {
    const tokenPayload: IPasswordResetJwtPayload = {
      userId,
      email,
      type: "resetPassword",
    };

    const passwordReset = await passwordResetEmail(tokenPayload);
    if (!passwordReset) {
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return;
    }

    /**
     * sending token as response for
     * development/testing/staging environment
     */
    const __token = isDevTestEnv
      ? {
          ...passwordReset,
        }
      : undefined;

    res.status(200).send({
      reset: {
        success: Boolean(passwordReset.createdAt),
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
