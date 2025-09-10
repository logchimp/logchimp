import type { Request, Response, NextFunction } from "express";
import type { IApiErrorResponse } from "@logchimp/types";
import database from "../database";

// utils
import { validEmail, validUUID } from "../helpers";
import logger from "../utils/logger";
import error from "../errorResponse.json";

export async function userExists(
  req: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  let email = (
    (req.body ? req.body.email : "") ||
    // @ts-expect-error
    (req.user ? req.user.email : "")
  ).toLowerCase();

  // As of now it only handles if the user_id is a param
  let id = req.params.user_id;

  if (!id) {
    if (!validEmail(email)) {
      return res.status(400).send({
        message: error.api.authentication.invalidEmail,
        code: "EMAIL_INVALID",
      });
    }
  } else {
    // setting email to null so that it doesn't coincide with user_id based API calls
    email = null;
    id = validUUID(id);
  }

  try {
    const user = await database
      .select()
      .from("users")
      .where({
        email: email || null,
      })
      .orWhere({
        userId: id || null,
      })
      .first();

    if (!user) {
      return res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
    }

    // fill req.user only for email based API calls
    if (email) {
      // @ts-expect-error
      req.user = user;
    }
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
