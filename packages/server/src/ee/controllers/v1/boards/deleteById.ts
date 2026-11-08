import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

import { validate as validateUUID } from "uuid";
import database from "../../../../database";
import { valkey } from "../../../../cache";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { BoardRepository } from "../../../repository/board";

const boardRepository = new BoardRepository(database, valkey);

export async function deleteById(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["DeleteBoardRequestBody"]
  >,
  res: Response,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

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
    await boardRepository.InvalidateBoardCache([boardId]);

    res.sendStatus(204);
  } else {
    res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_NOT_FOUND",
    });
  }
}
