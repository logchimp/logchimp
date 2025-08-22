import type { Request, Response } from "express";
import { isDevTestEnv } from "../../../helpers";

export async function validateToken(req: Request, res: Response) {
  // @ts-ignore
  const emailToken = req.emailToken;

  /**
   * sending token as response for
   * development/testing/staging environment
   */
  const __token = isDevTestEnv
    ? {
        ...emailToken,
      }
    : "";

  res.status(200).send({
    reset: {
      valid: emailToken,
      ...__token,
    },
  });
}
