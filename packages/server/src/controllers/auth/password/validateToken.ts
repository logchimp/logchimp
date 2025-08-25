import type { Response } from "express";
import type { IPasswordResetValidationTokenResponseBody } from "@logchimp/types";
import { isDevTestEnv } from "../../../helpers";
import type { ExpressRequestContext } from "../../../express";

export async function validateToken(
  req: ExpressRequestContext,
  res: Response<IPasswordResetValidationTokenResponseBody>,
) {
  const emailToken = req.ctx.token;

  /**
   * sending token as response for
   * development/testing/staging environment
   */
  const __token = isDevTestEnv
    ? {
        ...emailToken,
      }
    : undefined;

  res.status(200).send({
    reset: {
      valid: Boolean(emailToken.createdAt),
      ...__token,
    },
  });
}
