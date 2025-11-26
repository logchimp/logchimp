import type { Request, Response } from "express";
import { z } from "zod";
import type {
  IApiErrorResponse,
  TFilterBoardRequestQuery,
  IFilterBoardResponseBody,
  ApiSortType,
  IBoardPrivate,
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

const querySchema = z.object({
  first: z.coerce
    .string()
    .transform((value) =>
      parseAndValidateLimit(value, GET_BOARDS_FILTER_COUNT),
    ),
  /**
   * For backward compatibility to support offset pagination,
   * will be removed in the next major release.
   */
  page: z.coerce
    .string()
    .optional()
    .transform((value) => (value ? parseAndValidatePage(value) : undefined)),
  limit: z.coerce
    .string()
    .optional()
    .transform((value) =>
      parseAndValidateLimit(value, GET_BOARDS_FILTER_COUNT),
    ),
  after: z.uuid().optional(),
  created: z.enum(["ASC", "DESC"]).default("ASC"),
});

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

  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.error.issues,
    });
  }

  const { first: _first, page, after, created, limit } = query.data;
  const first = req.query?.limit ? limit : _first;

  try {
    const boards = await getBoards({ first, page, after, created });
    const boardsLength = boards.length;

    let startCursor: string | null = null;
    let endCursor: string | null = null;

    if (!page) {
      startCursor = boardsLength > 0 ? String(boards[0].boardId) : null;
      endCursor =
        boardsLength > 0 ? String(boards[boardsLength - 1].boardId) : null;
    }

    let totalCount: number | null = null;
    let totalPages: number | null = null;
    let currentPage = 1;
    let hasNextPage = false;

    if (!page) {
      const boardsMetaData = await getBoardMetaData({ after });

      if (boardsMetaData) {
        totalCount = boardsMetaData.totalBoardsCount;
        totalPages = Math.ceil(boardsMetaData.totalBoardsCount / first);
        hasNextPage = boardsMetaData.remainingBoardsCount - first > 0;
      }

      if (after) {
        const seenBoards = totalCount - boardsMetaData.remainingBoardsCount;
        currentPage = Math.floor(seenBoards / first) + 1;
      }
    }

    res.status(200).send({
      boards,
      results: boards,
      ...(page
        ? {}
        : {
            page_info: {
              count: boardsLength,
              current_page: currentPage,
              has_next_page: hasNextPage,
              end_cursor: endCursor,
              start_cursor: startCursor,
            },
            total_pages: totalPages,
            total_count: totalCount,
          }),
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

interface IGetBoardQueryOptions {
  first: number;
  after?: string;
  created: ApiSortType;
  page?: number;
}

export async function getBoards({
  first,
  after,
  created,
  page,
}: IGetBoardQueryOptions) {
  try {
    let boardsQuery = database<IBoardPrivate>("boards")
      .select(
        "boards.boardId",
        "boards.name",
        "boards.color",
        "boards.url",
        "boards.createdAt",
        "display",
        "view_voters",
      )
      .count("posts", { as: "post_count" })
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .where({
        "boards.display": true,
      })
      .groupBy("boards.boardId")
      .orderBy("boards.createdAt", created)
      .orderBy("boards.boardId", created)
      .limit(first);

    if (page) {
      boardsQuery = boardsQuery.offset(first * (page - 1));
    } else if (after) {
      const afterBoard = await database("boards")
        .select<{
          boardId: string;
          createdAt: string;
        }>("boardId", "createdAt")
        .where("boardId", after)
        .first();

      if (!afterBoard) return [];

      const operator = created === "ASC" ? ">" : "<";

      boardsQuery = boardsQuery.whereRaw('("boards"."createdAt", "boards"."boardId")' + operator + '(?, ?)',
        [afterBoard.createdAt, after])
        .offset(1);
    }

    const boardsData = await boardsQuery;
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
  return database.transaction(async (trx) => {
    const totalCountResult = await trx("boards")
      .where("display", true)
      .count<{ count: string }>("* as count")
      .first();

    const totalBoardsCount = Number.parseInt(totalCountResult.count, 10);

    let remainingBoardsCount = totalBoardsCount;
    if (after) {
      const afterBoard = await trx("boards")
        .select<{
          createdAt: string;
        }>("createdAt")
        .where({
          boardId: after,
          display: true,
        })
        .first();

      if (afterBoard) {
        const subQuery = trx("boards")
          .where("display", true)
          .andWhere("createdAt", ">=", afterBoard.createdAt)
          .offset(1);

        const remaining = await trx
          .count<{ count: string }>("* as count")
          .from(subQuery.as("next"))
          .first();

        remainingBoardsCount = Number.parseInt(remaining.count, 10);
      }
    }

    return {
      totalBoardsCount,
      remainingBoardsCount,
    };
  });
}
