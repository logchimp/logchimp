import type { Request, Response } from "express";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function getProfile(req: Request, res: Response) {
  // @ts-expect-error
  const { userId } = req.user;

  try {
    const user = await database
      .select("userId", "name", "username", "email", "isVerified")
      .from("users")
      .where({
        userId,
      })
      .first();

    res.status(200).send({
      user,
    });
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
