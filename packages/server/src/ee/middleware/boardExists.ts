import type { NextFunction, Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";
import database from "../../database";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

type RequestParams = operations["getBoardByUrl"]["parameters"]["path"];
type RequestBody =
  | components["schemas"]["UpdateBoardRequestBody"]
  | components["schemas"]["DeleteBoardRequestBody"];

export async function boardExists(
  req: Request<RequestParams, unknown, RequestBody>,
  res: Response<components["schemas"]["GenericAPIErrorResponseBody"]>,
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
    .select("boardId", "url", "display")
    .from("boards")
    .where((builder) => {
      if (boardId) builder.where("boardId", boardId);
      if (url) builder.where("url", url);
    })
    .first();

  if (!board) {
    res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  req.board = board;
  next();
}
