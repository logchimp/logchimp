import database from "../../database";

// utils
import { validUUID } from "../../helpers";
import error from "../../errorResponse.json";

export async function boardExists(req, res, next) {
  const id = validUUID(req.body.boardId);
  const url = req.params.url;

  const board = await database
    .select()
    .from("boards")
    .where({
      boardId: id || null,
    })
    .orWhere({
      url: url || null,
    })
    .first();

  if (!board) {
    return res.status(404).send({
      message: error.api.boards.boardNotFound,
      code: "BOARD_NOT_FOUND",
    });
  }

  req.board = board;
  next();
}
