import type { Request, Response, NextFunction } from "express";
import type {
  IApiErrorResponse,
  IAuthSignupResponseBody,
  TAuthSignupRequestBody,
} from "@logchimp/types";

// services
import { createUser } from "../../services/auth/createUser";
import database from "../../database";

// utils
import { validEmail } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = IAuthSignupResponseBody | IApiErrorResponse;

export async function signup(
  req: Request<unknown, unknown, TAuthSignupRequestBody>,
  res: Response<ResponseBody>,
  next: NextFunction,
) {
  const { email, password } = req.body;

  if (!validEmail(email)) {
    return res.status(400).send({
      message: error.api.authentication.invalidEmail,
      code: "EMAIL_INVALID",
    });
  }

  if (!password) {
    return res.status(400).send({
      message: error.api.authentication.noPasswordProvided,
      code: "PASSWORD_MISSING",
    });
  }

  try {
    const settings = await database.select().from("settings").first();

    if (!settings.allowSignup) {
      return res.status(400).send({
        message: error.api.roles.notEnoughPermission,
        code: "SIGNUP_NOT_ALLOWED",
      });
    }

    const user = await createUser(req, res, next, {
      email,
      password,
    });

    // if user already exists, createUser returns null
    if (!user) return;

    res.status(201).send({ user });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
