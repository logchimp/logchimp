import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  ISetPasswordRequestBody,
  IValidateEmailVerificationTokenRequestBody,
  TEmailVerification,
} from "@logchimp/types";

// database
import database from "../database";

// utils
import logger from "../utils/logger";
import { configManager } from "../utils/logchimpConfig";
import type { ExpressRequestContext } from "../express";
import error from "../errorResponse.json";
import type {
  IPasswordResetJwtPayload,
  IVerifyEmailJwtPayload,
} from "../types";

const config = configManager.getConfig();

type RequestBody =
  | IValidateEmailVerificationTokenRequestBody
  | ISetPasswordRequestBody;
type ResponseBody = IApiValidationErrorResponse | IApiErrorResponse;

export async function validateEmailToken(
  req: ExpressRequestContext<unknown, unknown, RequestBody>,
  res: Response<ResponseBody>,
  next: NextFunction,
) {
  const token = req.body.token;

  if (!token) {
    return res.status(400).send({
      errors: [
        token
          ? undefined
          : {
              message: error.api.emailVerify.tokenMissing,
              code: "MISSING_TOKEN",
            },
      ],
    });
  }

  try {
    // validate JWT token
    const decoded = jwt.verify(token, config.secretKey) as JwtPayload &
      (IVerifyEmailJwtPayload | IPasswordResetJwtPayload);

    const tokenType = decoded.type;
    const emailToken = await database<TEmailVerification>(tokenType)
      .select()
      .where({ token })
      .first();

    if (!emailToken) {
      return res.status(404).send({
        message: error.api.emailVerify.invalidToken,
        code: "INVALID_TOKEN",
      });
    }

    // @ts-ignore
    req.user = { email: emailToken.email };

    if (!req.ctx) {
      req.ctx = {};
    }
    req.ctx.token = emailToken;
    next();
  } catch (err) {
    logger.error({
      message: err,
    });

    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      res.status(401).send({
        message: error.middleware.auth.invalidToken,
        code: "INVALID_TOKEN",
      });
    } else {
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
    }
  }
}
