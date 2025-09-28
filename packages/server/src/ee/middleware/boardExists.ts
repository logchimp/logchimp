import type { Request, Response, NextFunction } from "express";
import type {
  IApiErrorResponse,
  IBoardDeleteRequestBody,
  IBoardUpdateRequestBody,
  IGetBoardByUrlRequestParams,
} from "@logchimp/types";
import database from "../../database";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

type RequestParams = IGetBoardByUrlRequestParams;
type RequestBody = IBoardUpdateRequestBody | IBoardDeleteRequestBody;

export async function boardExists(
  req: Request<RequestParams, unknown, RequestBody>,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const url = req.params.url;

  const boardId = validUUID(req.body.boardId);

  if (!boardId && !url) {
    res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_ID_OR_URL_MISSING",
    });
    return;
  }

  const board = await database
    .select("boardId", "url")
    .from("boards")
    .where((builder) => {
      if (boardId) builder.where("boardId", boardId);
      if (url) builder.where("url", url);
    })
    .first();

  if (!board) {
    return res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_NOT_FOUND",
    });
  }

  // @ts-expect-error
  req.board = board;
  next();
}
