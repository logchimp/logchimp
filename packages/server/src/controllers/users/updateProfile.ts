import type { Request, Response } from "express";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { validUsername } from "../../helpers";

export async function updateProfile(req: Request, res: Response) {
  // @ts-ignore
  const userId = req.user.userId;
  const name = req.body.name;
  const username = req.body.username;

  if (name?.length >= 30) {
    res.status(400).send({
      name: "Name cannot execed 30 characters",
      code: "NAME_LENGTH",
    });
    return;
  }

  if (username?.length >= 30) {
    res.status(400).send({
      username: "Username cannot execed 30 characters",
      code: "USERNAME_LENGTH",
    });
    return;
  }

  if (username && validUsername(username)) {
    res.status(400).send({
      username: "The username cannot contain HTML, JavaScript, or SQL content",
      code: "USERNAME_CONTENT",
    });
    return;
  }

  try {
    const users = await database
      .update({
        name,
        username,
        updatedAt: new Date().toJSON(),
      })
      .from("users")
      .where({
        userId,
      })
      .returning(["userId", "name", "username", "email"]);

    const user = users[0];

    res.status(200).send({ user });
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
