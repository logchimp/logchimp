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
import { isDomainBlacklisted } from "src/utils/domainBlacklist";

export async function reset(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const { userId, email } = req.user;

  if (isDomainBlacklisted(email)) {
    return res.status(403).send({
      message: "The domain of the email is not allowed.",
      code: "DOMAIN_BLACKLISTED",
    });
  }

  if (isDomainBlacklisted(email)) {
    return res.status(403).send({
      message: "The domain of the email is not allowed.",
      code: "DOMAIN_BLACKLISTED",
    });
  }

  try {
    const tokenPayload: IPasswordResetJwtPayload = {
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
