import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetBoardByUrlRequestParams,
  IGetBoardsByUrlResponseBody,
  TPermission,
} from "@logchimp/types";

import database from "../../../../database";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { validUUID } from "../../../../helpers";

type ResponseBody = IGetBoardsByUrlResponseBody | IApiErrorResponse;

export async function boardByUrl(
  req: Request<IGetBoardByUrlRequestParams>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const board = req.board;
  const boardId = validUUID(board?.boardId);
  if (!boardId) {
    res.status(403).send({
      message: error.api.boards.boardIdMissing,
      code: "BOARD_ID_MISSING",
    });
    return;
  }

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as TPermission[];
  const hasPermission = permissions.includes("board:read");

  if (!hasPermission && !board.display) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    const board = await database
      .select(
        "boards.boardId",
        "boards.name",
        "boards.color",
        "boards.url",
        "boards.display",
        "boards.view_voters",
        "boards.createdAt",
      )
      .count("posts", { as: "post_count" })
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .where({
        "boards.boardId": boardId,
      })
      .groupBy("boards.boardId")
      .first();

    res.status(200).send({ board });
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
