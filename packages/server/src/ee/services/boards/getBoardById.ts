import type { IBoard } from "@logchimp/types";

import database from "../../../database";
import * as cache from "../../../cache";
import { DAY } from "../../../cache/time";

// utils
import logger from "../../../utils/logger";

export async function getBoardById(boardId: string): Promise<IBoard | null> {
  const cacheKey = `board:public:${boardId}`;
  if (cache.isActive) {
    const cachedBoard = await cache.valkey.get(cacheKey);
    if (cachedBoard) {
      return JSON.parse(cachedBoard) satisfies IBoard;
    }
  }

  let boardFromDb: IBoard;
  try {
    boardFromDb = await database<IBoard>("boards")
      .select("boardId", "name", "url", "color", "createdAt")
      .where({
        boardId,
      })
      .first();
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    return null;
  }

  if (boardFromDb) {
    if (cache.isActive) {
      try {
        await cache.valkey.set(
          cacheKey,
          JSON.stringify(boardFromDb),
          "EX",
          DAY * 7,
        );
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
    }

    return boardFromDb;
  }

  return null;
}
