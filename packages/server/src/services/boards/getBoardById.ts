import type { IBoard } from "@logchimp/types";
import database from "../../database";

// utils
import logger from "../../utils/logger";

export async function getBoardById(boardId: string): Promise<IBoard | null> {
  try {
    const board = await database("boards")
      .select("boardId", "name", "url", "color", "createdAt")
      .where({
        boardId,
      })
      .first();

    if (board) {
      return board;
    }

    return null;
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    return null;
  }
}
