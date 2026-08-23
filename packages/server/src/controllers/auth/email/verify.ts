import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IAuthEmailVerifyResponseBody,
} from "@logchimp/types";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import type {
  IAuthenticationMiddlewareUser,
  IVerifyEmailJwtPayload,
} from "../../../types";
import { getUserById } from "../../../repository/user";
import database from "../../../database";
import { mailWorker } from "../../../worker/handler/mail";
import { sendAccountVerificationEmail } from "../../../services/mail/worker.service";

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

    if (mailWorker.isRunning) {
      // TODO: send account email verification using worker
    } else {
      await sendAccountVerificationEmail(tokenPayload);
    }

    res.status(200).send({
      verify: {
        success: true,
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
