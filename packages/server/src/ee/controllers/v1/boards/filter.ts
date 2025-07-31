import type { Request, Response } from "express";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function filter(req: Request, res: Response) {
  const created = req.query.created;
  // @ts-ignore
  const page = req.query.page - 1;
  const limit = req.query.limit || 10;

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
      // @ts-ignore
      .orderBy("boards.createdAt", created)
      // @ts-ignore
      .limit(limit)
      // @ts-ignore
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
