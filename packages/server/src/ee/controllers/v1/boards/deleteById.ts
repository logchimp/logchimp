import type { Request, Response } from "express";
import { validate as validateUUID } from "uuid";
import type { IBoardDeleteRequestBody, TPermission } from "@logchimp/types";
import database from "../../../../database";
import * as cache from "../../../../cache";
import { invalidateBoardCache } from "../../../services/boards/invalidateCache";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function deleteById(
  req: Request<unknown, unknown, IBoardDeleteRequestBody>,
  res: Response,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const boardId = req.body.boardId;
  if (!validateUUID(boardId)) {
    res.status(403).send({
      message: error.api.boards.boardIdMissing,
      code: "BOARD_ID_MISSING",
    });
    return;
  }

  const checkPermission = permissions.includes("board:destroy");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  let boardDeleted: number;
  try {
    boardDeleted = await database.delete().from("boards").where({
      boardId,
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

  if (boardDeleted) {
    if (cache.isActive) {
      await invalidateBoardCache(boardId);
    }

    res.sendStatus(204);
  } else {
    res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_NOT_FOUND",
    });
  }
}
