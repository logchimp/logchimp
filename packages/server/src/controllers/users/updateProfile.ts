import type { Request, Response } from "express";
import database from "../../database";

// utils
import { sanitiseName } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function updateProfile(req: Request, res: Response) {
  // @ts-ignore
  const userId = req.user.userId;
  const name = sanitiseName(req.body.name);

  if (name?.length > 30) {
    res.status(400).send({
      name: "Name cannot exceed 30 characters",
      code: "NAME_LENGTH",
    });
    return;
  }

  try {
    const users = await database
      .update({
        name,
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
