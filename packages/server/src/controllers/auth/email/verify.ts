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
import type { IVerifyEmailJwtPayload } from "../../../types";

type ResponseBody = IAuthEmailVerifyResponseBody | IApiErrorResponse;

export async function verify(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const { userId, email, isVerified } = req.user;

  if (isVerified) {
    return res.status(409).send({
      message: error.api.emailVerify.emailAlreadyVerified,
      code: "EMAIL_VERIFIED",
    });
  }

  try {
    const tokenPayload: IVerifyEmailJwtPayload = {
      userId,
      email,
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
