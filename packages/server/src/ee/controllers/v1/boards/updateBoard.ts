import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  IBoardUpdateRequestBody,
  TBoardUpdateResponseBody,
  TPermission,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | TBoardUpdateResponseBody
  | IApiErrorResponse
  | IApiValidationErrorResponse;

export async function updateBoard(
  req: Request<unknown, unknown, IBoardUpdateRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  // @ts-expect-error
  const boardId = req.board.boardId;

  const { name, url, color, view_voters, display } = req.body;

  const checkPermission = permissions.includes("board:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  if (!url) {
    return res.status(400).send({
      errors: [
        url
          ? undefined
          : {
              message: error.api.boards.urlMissing,
              code: "BOARD_URL_MISSING",
            },
      ],
    });
  }

  const slimUrl = url.replace(/\W+/gi, "-").trim().toLowerCase();

  try {
    const boards = await database
      .update({
        name,
        url: slimUrl,
        color,
        view_voters,
        display,
        updatedAt: new Date().toJSON(),
      })
      .from("boards")
      .where({
        boardId,
      })
      .returning("*");

    const board = boards[0];

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
