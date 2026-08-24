import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ICreateSiteSetupRequestBody,
  TCreateSiteSetupResponseBody,
} from "@logchimp/types";

// database
import database from "../../database";
import * as cache from "../../cache";
import { CACHE_KEYS } from "../../cache/keys";

import { validEmail } from "../../helpers";
import error from "../../errorResponse.json";
import logger from "../../utils/logger";
import { AuthService } from "../../services/auth/auth.service";
import {
  UserExistsError,
  UsernameExistsError,
} from "../../services/auth/errors";

type ResponseBody = TCreateSiteSetupResponseBody | IApiErrorResponse;

export async function setup(
  req: Request<unknown, unknown, ICreateSiteSetupRequestBody>,
  res: Response<ResponseBody>,
) {
  const { name, email, password } = req.body;
  const siteTitle = String(req.body?.siteTitle || "").trim();

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
    const isSetup = await database
      .select()
      .from("users")
      .where({
        isOwner: true,
      })
      .first();

    if (isSetup) {
      return res.status(403).send({
        message: error.api.authentication.setupAlreadyCompleted,
        code: "SETUP_COMPLETED",
      });
    }

    const authService = new AuthService();
    const user = await authService.CreateUser(email, {
      password,
      name,
    });

    // set user as owner
    await database
      .update({
        isOwner: true,
      })
      .from("users")
      .where({
        userId: user.userId,
      });

    if (siteTitle) {
      await database
        .update({
          title: siteTitle,
        })
        .from("settings");

      if (cache.isActive) {
        try {
          await cache.valkey.del(CACHE_KEYS.SITE_SETTINGS);
        } catch (err) {
          logger.error({ message: err });
        }
      }
    }

    res.status(201).send({ user });
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
