import type { Request, Response } from "express";

// service
import { createToken } from "../../services/token.service";

// utils
import { validatePassword } from "../../utils/password";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function login(req: Request, res: Response) {
  // @ts-ignore
  const user = req.user;
  const password = req.body.password;

  if (user.isBlocked) {
    return res.status(403).send({
      message: error.middleware.user.userBlocked,
      code: "USER_BLOCKED",
    });
  }

  if (!password) {
    return res.status(400).send({
      message: error.api.authentication.noPasswordProvided,
      code: "PASSWORD_MISSING",
    });
  }

  try {
    const validateUserPassword = await validatePassword(
      password,
      user.password,
    );
    if (!validateUserPassword) {
      return res.status(403).send({
        message: error.middleware.user.incorrectPassword,
        code: "INCORRECT_PASSWORD",
      });
    }

    // generate authToken
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
    };
    const authToken = createToken(tokenPayload, {
      expiresIn: "2d",
    });

    res.status(200).send({
      user: {
        authToken,
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
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
