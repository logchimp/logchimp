import database from "../../database";

// utils
import logger from "../../utils/logger";

export async function getBoardById(boardId) {
  try {
    const boards = await database
      .select()
      .from("boards")
      .where({
        boardId,
      })
      .limit(1);

    const board = boards[0];
    if (board) {
      return board;
    } else {
      return null;
    }
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });
  }
}
