import type { Request, Response } from "express";
import { validate } from "uuid";
import type {
  IApiErrorResponse,
  IGetBoardByUrlRequestParams,
  IGetBoardsByUrlResponseBody,
} from "@logchimp/types";
import database from "../../../../database";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = IGetBoardsByUrlResponseBody | IApiErrorResponse;

export async function boardByUrl(
  req: Request<IGetBoardByUrlRequestParams>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const boardId = req.board.boardId;
  if (!validate(boardId)) {
    res.status(403).send({
      message: error.api.boards.boardIdMissing,
      code: "BOARD_ID_MISSING",
    });
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
