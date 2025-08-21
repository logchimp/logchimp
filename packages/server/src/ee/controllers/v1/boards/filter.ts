import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TFilterBoardRequestQuery,
  IFilterBoardResponseBody,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = IFilterBoardResponseBody | IApiErrorResponse;

export async function filter(
  req: Request<unknown, unknown, unknown, TFilterBoardRequestQuery>,
  res: Response<ResponseBody>,
) {
  const created = req.query.created;
  const limit = req.query.limit || 10;

  let page = 0;
  if (req.query.page) {
    page = Number.parseInt(req.query.page, 10) - 1;
  }

  try {
    const boards = await database
      .select("boards.boardId", "boards.name", "boards.color", "boards.url")
      .count("posts", { as: "post_count" })
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .where({
        display: true,
      })
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)
      .limit(limit)
      .offset(limit * page);

    res.status(200).send({ boards });
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
