import type { NextFunction, Request, Response } from "express";
import type { TPermission } from "@logchimp/types";

import {
  computePermissions,
  verifyJwtAuthToken,
  extractTokenFromHeader,
  getUserInfoWithRoles,
} from "./helpers";
import type {
  IGetUserInfoWithRoles,
  IAuthenticationTokenPayload,
} from "../../types";
import logger from "../../utils/logger";
import { configManager } from "../../utils/logchimpConfig";
const config = configManager.getConfig();

// Allow the user to proceed with optional authentication
export async function authOptional(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // extract token from authorization header
  const token = extractTokenFromHeader(req.headers.authorization);

  let decoded: IAuthenticationTokenPayload;
  try {
    decoded = verifyJwtAuthToken(token, config.secretKey);
  } catch (_err) {
    // ignore error from JWT auth token verification
    // and move to next middlware
  }
  if (!decoded && !decoded?.userId) {
    return next();
  }

  let user: IGetUserInfoWithRoles;
  try {
    user = await getUserInfoWithRoles(decoded.userId);
  } catch (err) {
    logger.error(err);
  }

  if (!user) {
    return next();
  }

  let permissions: TPermission[] = [];
  try {
    permissions = await computePermissions(user);
  } catch (err) {
    logger.error(err);
  }

  // @ts-expect-error
  req.user = {
    ...user,
    permissions,
  };
  next();
}
