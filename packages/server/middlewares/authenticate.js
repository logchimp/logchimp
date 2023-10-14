const jwt = require("jsonwebtoken");
const database = require("../database");
const error = require("../errorResponse.json");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();

const extractTokenFromHeader = (header) => {
  const [scheme, token] = header.split(" ");

  if (/^Bearer$/i.test(scheme)) {
    return token;
  }
};

const computePermissions = async (user) => {
  // return all permission for owner
  if (user.isOwner) {
    const perms = await database
      .select(
        database.raw(
          "COALESCE( ARRAY_AGG(CONCAT(p.type, ':', p.action)), '{}') AS permissions",
        ),
      )
      .from("permissions AS p")
      .first();

    return perms.permissions;
  }

  // get permissions for roles
  const roles = user.roles;
  const perms = await database
    .select(
      database.raw(
        "COALESCE( ARRAY_AGG( DISTINCT( CONCAT( p.type, ':', p.action))), '{}') AS permissions",
      ),
    )
    .from("roles")
    .innerJoin("permissions_roles", "roles.id", "permissions_roles.role_id")
    .innerJoin("permissions AS p", "permissions_roles.permission_id", "p.id")
    .whereIn("roles.id", roles)
    .first();

  return perms.permissions;
};

const authenticateWithToken = async (req, res, next, token) => {
  const decoded = jwt.decode(token, { complete: true });

  // validate JWT token type
  if (!decoded?.header) {
    return res.status(401).send({
      message: error.middleware.auth.invalidToken,
      code: "INVALID_JWT",
    });
  }

  const userId = decoded.payload.userId;

  try {
    const user = await database
      .select(
        "u.userId",
        "u.name",
        "u.username",
        "u.email",
        "u.isOwner",
        "u.isBlocked",
        database.raw("ARRAY_AGG(r.id) AS roles"),
      )
      .from("users AS u")
      .leftJoin("roles_users AS ru", "u.userId", "ru.user_id")
      .leftJoin("roles AS r", "ru.role_id", "r.id")
      .groupBy("u.userId")
      .where({
        userId,
      })
      .first();

    if (!user) {
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }

    const permissions = await computePermissions(user);

    if (user) {
      try {
        // validate JWT auth token
        const secretKey = config.server.secretKey;
        jwt.verify(token, secretKey);

        req.user = {
          ...user,
          permissions,
        };
        next();
      } catch (err) {
        if (
          err.name === "TokenExpiredError" ||
          err.name === "JsonWebTokenError"
        ) {
          return res.status(401).send({
            message: error.middleware.auth.invalidToken,
            code: "INVALID_TOKEN",
            err,
          });
        } else {
          res.status(500).send({
            message: error.general.serverError,
            code: "SERVER_ERROR",
          })
        }
      }
    } else {
      // user not found
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }
  } catch (err) {
    logger.error(err);

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    })
  }
};

const token = (req, res, next) => {
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

module.exports = token;
