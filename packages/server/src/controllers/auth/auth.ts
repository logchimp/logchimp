import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IAuthLoginRequestBody,
  IAuthLoginResponseBody,
  IAuthMeResponseBody,
} from "@logchimp/types";
import { getUserById } from "../../repository/user";
import database from "../../database";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { AuthService } from "../../services/auth/auth.service";
import {
  IncorrectPasswordError,
  InvalidEmailError,
  PasswordMissingError,
  UserBlockedError,
  UserNotFoundError,
} from "../../services/auth/errors";

type GetMeResponseBody = IAuthMeResponseBody | IApiErrorResponse;
type PasswordLoginResponseBody = IAuthLoginResponseBody | IApiErrorResponse;

export async function passwordLogin(
  req: Request<unknown, unknown, IAuthLoginRequestBody>,
  res: Response<PasswordLoginResponseBody>,
) {
  const authService = new AuthService();

  try {
    const user = await authService.PasswordLogin(
      req.body.email,
      req.body.password,
    );

    res.status(200).send({
      user: {
        authToken: user.authToken,
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err instanceof InvalidEmailError) {
      res.status(400).send({
        message: error.api.authentication.invalidEmail,
        code: "EMAIL_INVALID",
      });
      return;
    }

    if (err instanceof UserNotFoundError || err instanceof UserBlockedError) {
      res.status(404).send({
        message: error.middleware.user.userNotFound,
        code: "USER_NOT_FOUND",
      });
      return;
    }

    if (err instanceof PasswordMissingError) {
      res.status(400).send({
        message: error.api.authentication.noPasswordProvided,
        code: "PASSWORD_MISSING",
      });
      return;
    }

    if (err instanceof IncorrectPasswordError) {
      res.status(403).send({
        message: error.middleware.user.incorrectPassword,
        code: "INCORRECT_PASSWORD",
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

export async function me(req: Request, res: Response<GetMeResponseBody>) {
  // @ts-expect-error
  const userId = req.user.userId;

  try {
    const user = await getUserById(database, userId);

    res.status(200).send({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
        // @ts-expect-error
        permissions: req.user.permissions,
      },
    });
  } catch (err) {
    logger.error({
      message: "Failed to get user by ID",
      error: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
