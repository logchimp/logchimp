import type { Request, Response } from "express";
import database from "../../../database";

// utils
import { hashPassword } from "../../../utils/password";
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";

export async function set(req: Request, res: Response) {
  // @ts-ignore
  const { userId, email } = req.user;
  const { password } = req.body;

  if (!password) {
    return res.status(400).send({
      errors: [
        password
          ? ""
          : {
              message: error.api.authentication.noPasswordProvided,
              code: "PASSWORD_MISSING",
            },
      ],
    });
  }

  try {
    const hashedPassword = hashPassword(password);

    await database
      .update({
        password: hashedPassword,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        userId,
      });

    await database.delete().from("resetPassword").where({
      email,
    });

    res.status(200).send({
      reset: {
        success: true,
      },
    });
  } catch (err) {
    logger.error(err);

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
