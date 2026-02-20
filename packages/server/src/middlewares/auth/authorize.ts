import type { Request, Response, NextFunction } from "express";

import error from "../../errorResponse.json";
import type { IAuthenticationMiddlewareUser } from "../../types";

const authorize = (req: Request, res: Response, next: NextFunction) => {
  // @ts-expect-error
  const user = req.user as IAuthenticationMiddlewareUser;
  if (!user || !user.userId) {
    res.status(401).send({
      message: error.middleware.auth.authorizationFailed,
      code: "AUTHORIZATION_FAILED",
    });
    return;
  }

  // user is blocked
  if (user.isBlocked) {
    res.status(403).send({
      message: error.middleware.user.userBlocked,
      code: "USER_BLOCK",
    });
    return;
  }

  const hasPermissions =
    Array.isArray(user.permissions) && user.permissions.length > 0;
  if (!hasPermissions) {
    res.status(403).send({
      message: error.middleware.auth.accessDenied,
      code: "ACCESS_DENIED",
    });
    return;
  }

  next();
};

export { authorize };
