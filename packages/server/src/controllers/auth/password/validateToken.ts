import type { Request, Response } from "express";
import type { IPasswordResetValidationTokenResponseBody } from "@logchimp/types";
import { isDevTestEnv } from "../../../helpers";

export async function validateToken(
  req: Request,
  res: Response<IPasswordResetValidationTokenResponseBody>,
) {
  // @ts-expect-error
  const emailToken = req.token;

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
