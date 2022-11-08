const error = require("../errorResponse.json");

const authorize = (req, res, next) => {
  const hasUser = req.user?.userId;

  if (hasUser) {
    // user is blocked
    const isBlocked = req.user.isBlocked;
    if (isBlocked) {
      return res.status(403).send({
        message: error.middleware.user.userBlocked,
        code: "USER_BLOCK",
      });
    }

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

module.exports = authorize;
