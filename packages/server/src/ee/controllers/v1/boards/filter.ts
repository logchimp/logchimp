import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TFilterBoardRequestQuery,
  IFilterBoardResponseBody,
  IGetBoardQueryOptions,
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
  if (req.query?.page) {
    logger.warn(
      "Offset-based pagination is deprecated and will be removed in next major release. Please migrate to cursor pagination instead.",
    );
  }

  const created = req.query.created?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const limit = parseAndValidateLimit(
    req.query?.limit,
    GET_BOARDS_FILTER_COUNT,
  );
  const page = parseAndValidatePage(req.query?.page);

  const after = req.query?.after;

  try {
    const boards = await getBoards({ limit, page, after, created });
    const boardsLength = boards.length;

    let startCursor: string | null = null;
    let endCursor: string | null = null;

    if (boardsLength > 0) {
      startCursor = boardsLength > 0 ? String(boards[0].boardId) : null;
      endCursor =
        boardsLength > 0 ? String(boards[boardsLength - 1].boardId) : null;
    }

    let totalCount: number | null = null;
    let hasNextPage = false;
    let currentPage = 1;

    const boardsMetaData = await getBoardMetaData({ after });
    totalCount = boardsMetaData.totalBoardsCount;
    const remainingBoardsCount = boardsMetaData.remainingBoardsCount;

    if (after) {
      hasNextPage = remainingBoardsCount - limit > 0;

      const seenResults = totalCount - remainingBoardsCount;
      currentPage = Math.floor(seenResults / limit) + 1;
    } else {
      const totalPages = Math.ceil(totalCount / limit);
      currentPage = page || 1;
      hasNextPage = currentPage < totalPages;
    }

    res.status(200).send({
      status: {
        code: 200,
        type: "success",
      },
      boards,
      page_info: {
        count: boardsLength,
        current_page: currentPage,
        has_next_page: hasNextPage,
        end_cursor: endCursor,
        start_cursor: startCursor,
      },
    });
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

export async function getBoards({
  limit,
  after,
  created,
  page,
}: IGetBoardQueryOptions) {
  try {
    let boards = database
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
        "boards.display": true,
      })
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)
      .orderBy("boards.boardId", created)
      .limit(limit);

    if (after) {
      const afterBoard = await database("boards")
        .select("createdAt", "boardId")
        .where("boardId", after)
        .first();

      if (!afterBoard) return [];

      const operator = created === "ASC" ? ">" : "<";

      boards = boards.where(function () {
        this.where("boards.createdAt", operator, afterBoard.createdAt).orWhere(
          function () {
            this.where("boards.createdAt", "=", afterBoard.createdAt).andWhere(
              "boards.boardId",
              operator,
              after,
            );
          },
        );
      });

      boards = boards.whereNot("boards.boardId", after);
    } else if (page) {
      boards = boards.offset(limit * (page - 1));
    }
    const boardsData = await boards;
    return boardsData;
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
    });
  }

  return [];
}

export async function getBoardMetaData({ after }: { after?: string }) {
  const totalCountResult = await database("boards")
    .where("display", true)
    .count<{ count: string }>("* as count")
    .first();

  const totalBoardsCount = Number(totalCountResult?.count || 0);

  let remainingBoardsCount = totalBoardsCount;
  if (after) {
    const afterBoard = await database("boards")
      .select("createdAt")
      .where("boardId", after)
      .first();

    if (afterBoard) {
      const subQuery = database("boards")
        .where("display", true)
        .andWhere("createdAt", ">=", afterBoard.createdAt)
        .offset(1);

      const remaining = await database
        .count<{ count: string }>("* as count")
        .from(subQuery.as("next"))
        .first();

      remainingBoardsCount = Number(remaining?.count || 0);
    }
  }

  return {
    totalBoardsCount,
    remainingBoardsCount,
  };
}
