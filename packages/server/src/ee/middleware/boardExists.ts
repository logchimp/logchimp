import type { Request, Response, NextFunction } from "express";
import { validate } from "uuid";
import type {
  IApiErrorResponse,
  IBoardDeleteRequestBody,
  IGetBoardByUrlRequestParams,
  TBoardUpdateResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import error from "../../errorResponse.json";

type RequestParams = IGetBoardByUrlRequestParams;
type RequestBody = TBoardUpdateResponseBody | IBoardDeleteRequestBody;

export async function boardExists(
  req: Request<RequestParams, unknown, RequestBody>,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const url = req.params.url;

  let boardId: string | null = null;
  if ("boardId" in req.body && validate(req.body.boardId)) {
    boardId = req.body.boardId;
  }

  const board = await database
    .select("boardId")
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
