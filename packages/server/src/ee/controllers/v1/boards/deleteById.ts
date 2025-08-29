import type { Request, Response } from "express";
import { validate as validateUUID } from "uuid";
import type { IBoardDeleteRequestBody } from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function deleteById(
  req: Request<unknown, unknown, IBoardDeleteRequestBody>,
  res: Response,
) {
  // @ts-ignore
  const permissions = req.user.permissions;

  const boardId = req.body.boardId;
  if (!validateUUID(boardId)) {
    res.status(403).send({
      message: error.api.boards.boardIdMissing,
      code: "BOARD_ID_MISSING",
    });
  }

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
