import type { NextFunction, Request, Response } from "express";
import type { IApiErrorResponse } from "@logchimp/types";

import type { IAuthenticationTokenPayload } from "../../types";
import error from "../../errorResponse.json";
import {
  computePermissions,
  extractTokenFromHeader,
  getUserInfoWithRoles,
  verifyJwtAuthToken,
} from "./helpers";
import logger from "../../utils/logger";
import { configManager } from "../../utils/logchimpConfig";
const config = configManager.getConfig();

const authenticateWithToken = async (
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
  token: string,
) => {
  let jwtTokenPayload: IAuthenticationTokenPayload;

  try {
    const secretKey = config.secretKey;
    jwtTokenPayload = verifyJwtAuthToken(token, secretKey);
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).send({
        message: error.middleware.auth.invalidToken,
        code: "INVALID_TOKEN",
        // err,
      });
    } else {
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
    }
  }

  try {
    const user = await getUserInfoWithRoles(jwtTokenPayload.userId);
    if (!user) {
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }

    const permissions = await computePermissions(user);

    // @ts-expect-error
    req.user = {
      ...user,
      permissions,
    };
    next();
  } catch (err) {
    logger.error(err);

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
};

// Only allow the user to proceed further after completing all the checks
const authRequired = (
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) => {
  // check for authorization header
  if (!req.headers?.authorization) {
    return res.status(400).send({
      message: error.middleware.auth.invalidAuthHeader,
      code: "INVALID_AUTH_HEADER",
    });
  }

  // extract token from authorization header
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).send({
      message: error.middleware.auth.invalidAuthHeaderFormat,
      code: "INVALID_AUTH_HEADER_FORMAT",
    });
  }

  authenticateWithToken(req, res, next, token);
};

export { authRequired };
