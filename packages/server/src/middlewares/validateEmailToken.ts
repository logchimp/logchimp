import jwt from "jsonwebtoken";

// database
import database from "../database";

// utils
import logger from "../utils/logger";
import logchimpConfig from "../utils/logchimpConfig";
const config = logchimpConfig();
import error from "../errorResponse.json";

export async function validateEmailToken(req, res, next) {
  const token = req.body.token;

  if (!token) {
    return res.status(400).send({
      errors: [
        token
          ? ""
          : {
              message: error.api.emailVerify.tokenMissing,
              code: "MISSING_TOKEN",
            },
      ],
    });
  }

  try {
    // validate JWT token
    const secretKey =
      process.env.LOGCHIMP_SECRET_KEY || config.server.secretKey;
    const decoded = jwt.verify(token, secretKey);

    // @ts-ignore
    const tokenType = decoded.type;
    const emailToken = await database
      .select()
      .from(tokenType)
      .where({ token })
      .first();

    if (!emailToken) {
      return res.status(404).send({
        message: error.api.emailVerify.invalidToken,
        code: "INVALID_TOKEN",
      });
    }

    req.user = { email: emailToken.email };

    req.emailToken = emailToken;
    next();
  } catch (err) {
    logger.error({
      message: err,
    });

    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).send({
        message: error.middleware.auth.invalidToken,
        code: "INVALID_TOKEN",
        err,
      });
    } else {
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
    }
  }
}
