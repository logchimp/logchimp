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
import { GET_BOARDS_FILTER_COUNT } from "../../../../constants";
import {
  parseAndValidateLimit,
  parseAndValidatePage,
} from "../../../../helpers";

type ResponseBody = IFilterBoardResponseBody | IApiErrorResponse;

export async function filter(
  req: Request<unknown, unknown, unknown, TFilterBoardRequestQuery>,
  res: Response<ResponseBody>,
) {
  const created = req.query.created?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const limit = parseAndValidateLimit(
    req.query?.limit,
    GET_BOARDS_FILTER_COUNT,
  );
  const page = parseAndValidatePage(req.query?.page);

  const rawCursor = req.query.cursor?.replace(" ", "T");
  const cursor = rawCursor ? new Date(rawCursor) : null;


  try {

    let query = database
      .select(
        "boards.boardId",
        "boards.name",
        "boards.color",
        "boards.url",
        "boards.createdAt",
      )
      .count("posts", { as: "post_count" })
      .from("boards")
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .where({
        display: true,
      })
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)

    if (cursor && !isNaN(cursor.getTime())) {
      if (created === "DESC") {
        query = query.where("boards.createdAt", "<", cursor).limit(limit);
      } else {
        query = query.where("boards.createdAt", ">", cursor).limit(limit);
      }
    } else {
      query = query.limit(limit).offset(limit * (page - 1));
    }

    const boards = await query;

    let nextCursor = null;
    if (boards.length > 0) {
      nextCursor = boards[boards.length - 1].createdAt;
    }

    res.status(200).send({ boards, nextCursor });
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
