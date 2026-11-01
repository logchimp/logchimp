import type { Request, Response } from "express";
import { isDevTestEnv } from "../../../helpers";
import type { components } from "@logchimp/api-ts-types";

export async function validateToken(
  req: Request,
  res: Response<
    components["schemas"]["ValidatePasswordResetTokenResponseBody"]
  >,
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
