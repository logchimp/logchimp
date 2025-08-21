import type { Request, Response, NextFunction } from "express";
import database from "../database";

// utils
import { validEmail } from "../helpers";
import logger from "../utils/logger";
import error from "../errorResponse.json";

export async function userExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const email = (
    (req.body ? req.body.email : "") ||
    // @ts-expect-error
    (req.user ? req.user.email : "")
  ).toLowerCase();

  if (!validEmail(email)) {
    return res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }

  try {
    const user = await database
      .select()
      .from("users")
      .where({
        email,
      })
      .first();

    if (!user) {
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }

    // @ts-expect-error
    req.user = user;
    next();
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
