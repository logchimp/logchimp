import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IAuthSignupResponseBody,
  TAuthSignupRequestBody,
} from "@logchimp/types";

import database from "../../database";
import { validEmail } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { AuthService } from "../../services/auth/auth.service";
import {
  UserExistsError,
  UsernameExistsError,
} from "../../services/auth/errors";

type ResponseBody = IAuthSignupResponseBody | IApiErrorResponse;

export async function signup(
  req: Request<unknown, unknown, TAuthSignupRequestBody>,
  res: Response<ResponseBody>,
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

    const authService = new AuthService();
    const user = await authService.CreateUser(email, {
      password,
    });

    const authToken = authService.generateUserAuthToken(
      user.userId,
      user.email,
    );

    res.status(201).send({
      user: {
        ...user,
        authToken,
      },
    });
  } catch (err) {
    if (err instanceof UserExistsError) {
      res.status(409).send({
        message: error.middleware.user.userExists,
        code: "USER_EXISTS",
      });
      return;
    }

    if (err instanceof UsernameExistsError) {
      res.status(409).send({
        message: error.api.authentication.usernameExists,
        code: "USERNAME_EXISTS",
      });
      return;
    }

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
