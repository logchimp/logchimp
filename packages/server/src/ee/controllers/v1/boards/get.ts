import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetBoardsRequestQuery,
  IGetBoardsResponseBody,
  TPermission,
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

type ResponseBody = IGetBoardsResponseBody | IApiErrorResponse;

export async function get(
  req: Request<unknown, unknown, unknown, IGetBoardsRequestQuery>,
  res: Response<ResponseBody>,
) {
  const created = req.query.created;
  const limit = parseAndValidateLimit(
    req.query?.limit,
    GET_BOARDS_FILTER_COUNT,
  );
  const page = parseAndValidatePage(req.query?.page);

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as TPermission[];
  const hasPermission = permissions.includes("board:read");

  try {
    const query = database
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
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)
      .limit(limit)
      .offset(limit * (page - 1));

    if (!hasPermission) {
      query.where({
        display: true,
      });
    }

    const boards = await query;

    res.status(200).send({ boards });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
