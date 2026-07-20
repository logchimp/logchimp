import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IAuthPasswordResetRequestBody,
  IAuthPasswordResetResponseBody,
} from "@logchimp/types";

// services
import { passwordReset as passwordResetEmail } from "../../../services/auth/passwordReset";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { isDevTestEnv, validEmail } from "../../../helpers";
import type { IPasswordResetJwtPayload } from "../../../types";
import { getUserByEmail } from "../../../repository/user";
import database from "../../../database";

type ResponseBody = IAuthPasswordResetResponseBody | IApiErrorResponse;

export async function reset(req: Request, res: Response<ResponseBody>) {
  const email = (req.body satisfies IAuthPasswordResetRequestBody).email;

  if (!validEmail(email)) {
    res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
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

    const tokenPayload: IPasswordResetJwtPayload = {
      userId: user.userId,
      email: user.email,
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
