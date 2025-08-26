import type { Request, Response, NextFunction } from "express";
import error from "../errorResponse.json";

const authorize = (req: Request, res: Response, next: NextFunction) => {
  // @ts-expect-error
  const hasUser = req.user?.userId;

  if (hasUser) {
    // user is blocked
    // @ts-expect-error
    const isBlocked = req.user.isBlocked;
    if (isBlocked) {
      return res.status(403).send({
        message: error.middleware.user.userBlocked,
        code: "USER_BLOCK",
      });
    }

    // @ts-expect-error
    const hasPermissions = req.user.permissions.length > 0;
    if (hasPermissions) {
      return next();
    } else {
      // In case user doesn't have any permissions
      return res.status(403).send({
        message: error.middleware.auth.accessDenied,
        code: "ACCESS_DENIED",
      });
    }
  } else {
    return res.status(401).send({
      message: error.middleware.auth.authorizationFailed,
      code: "AUTHORIZATION_FAILED",
    });
  }
};

export { authorize };
