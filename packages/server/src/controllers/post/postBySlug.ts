import type { Request, Response } from "express";
import database from "../../database";

// services
import { getVotes } from "../../services/votes/getVotes";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function postBySlug(req: Request, res: Response) {
  const userId = validUUID(req.body.userId);
  // @ts-ignore
  const post = req.post;

  try {
    const author = await database
      .select("userId", "name", "username", "avatar")
      .from("users")
      .where({
        userId: post.userId,
      })
      .first();

    const voters = await getVotes(post.postId, userId);

    const board = await database
      .select("boardId", "name", "url", "color")
      .from("boards")
      .where({
        boardId: post.boardId,
      })
      .first();

    const roadmap = await database
      .select("id", "name", "url", "color")
      .from("roadmaps")
      .where({
        id: post.roadmap_id,
      })
      .first();

    post.boardId = undefined;
    post.userId = undefined;
    post.roadmap_id = undefined;

    res.status(200).send({
      post: {
        board,
        author,
        roadmap,
        ...post,
        voters,
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
