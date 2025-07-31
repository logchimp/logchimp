import type { Request, Response } from "express";
import database from "../../../../database";

// utils
import { validUUID } from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function deleteById(req: Request, res: Response) {
  // @ts-ignore
  const permissions = req.user.permissions;

  const boardId = validUUID(req.body.boardId);

  const checkPermission = permissions.includes("board:destroy");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    await database.delete().from("boards").where({
      boardId,
    });

    res.sendStatus(204);
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
