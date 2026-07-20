import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IAuthEmailVerifyResponseBody,
} from "@logchimp/types";

// services
import { verifyEmail } from "../../../services/auth/verifyEmail";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { isDevTestEnv } from "../../../helpers";
import type {
  IAuthenticationMiddlewareUser,
  IVerifyEmailJwtPayload,
} from "../../../types";
import { getUserById } from "../../../repository/user";
import database from "../../../database";

type ResponseBody = IAuthEmailVerifyResponseBody | IApiErrorResponse;

export async function verify(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const reqUser = req.user as IAuthenticationMiddlewareUser;

  try {
    const user = await getUserById(database, reqUser.userId);
    if (!user) {
      res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    if (user.isVerified) {
      res.status(409).send({
        message: error.api.emailVerify.emailAlreadyVerified,
        code: "EMAIL_VERIFIED",
      });
      return;
    }

    const tokenPayload: IVerifyEmailJwtPayload = {
      userId: user.userId,
      email: user.email,
      type: "emailVerification",
    };

    const emailVerification = await verifyEmail(tokenPayload);
    if (!emailVerification) {
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return;
    }

    /**
     * sending token as response is for
     * development/testing environment
     */
    const __token = isDevTestEnv
      ? {
          ...emailVerification,
        }
      : undefined;

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
