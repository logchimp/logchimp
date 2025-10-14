import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  TFilterBoardRequestQuery,
  IFilterBoardResponseBody,
} from "@logchimp/types";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { GET_BOARDS_FILTER_COUNT } from "../../../../constants";
import {
  parseAndValidateLimit,
  parseAndValidatePage,
} from "../../../../helpers";
import { getBoards, getBoardMetaData } from "../../../services/boards/getBoards";

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
      endCursor = boardsLength > 0 ? String(boards[boardsLength - 1].boardId) : null;
    }

    let totalCount: number | null = null;
    let hasNextPage = false;
    let nextCursor: string | null = null;
    let currentPage = 1;

    const boardsMetaData = await getBoardMetaData({ after });
    totalCount = boardsMetaData.totalBoardsCount;
    const remainingBoardsCount = boardsMetaData.remainingBoardsCount;

    if (after) {
      hasNextPage = remainingBoardsCount > limit;
      nextCursor = hasNextPage ? endCursor : null;

      const seenResults = totalCount - remainingBoardsCount;
      currentPage = Math.floor(seenResults / limit) + 1;
    } else {
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = page || 1;
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
      }
    })

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
