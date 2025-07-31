import type { Request, Response } from "express";
import database from "../../database";

// services
import { getBoardById } from "../../services/boards/getBoardById";
import { getVotes } from "../../services/votes/getVotes";

// utils
import { validUUID, validUUIDs } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function filterPost(req: Request, res: Response) {
  const userId = validUUID(req.body.userId);
  const boardId = validUUIDs(req.body.boardId);
  const roadmapId = validUUID(req.body.roadmapId);
  /**
   * top, latest, oldest, trending
   */
  const created = req.body.created;
  const page = req.body.page - 1;
  const limit = req.body.limit || 10;

  try {
    const { rows: response } = await database.raw(
      `
        SELECT
          "postId",
          "title",
          "slug",
          "boardId",
          "roadmap_id",
          "contentMarkdown",
          "createdAt"
        FROM
          posts
        ${
          boardId.length > 0
            ? `WHERE "boardId" IN (${boardId.map((item) => {
                return `'${item}'`;
              })})`
            : ""
        }
        ${roadmapId ? "WHERE roadmap_id = :roadmapId" : ""}
        ORDER BY "createdAt" ${created}
        LIMIT :limit
        OFFSET :offset;
    `,
      {
        limit,
        offset: limit * page,
        roadmapId,
      },
    );

    const posts = [];

    for (let i = 0; i < response.length; i++) {
      const postId = response[i].postId;
      const boardId = response[i].boardId;
      const roadmapId = response[i].roadmap_id;

      try {
        const board = await getBoardById(boardId);
        const voters = await getVotes(postId, userId);
        const roadmap = await database
          .select("id", "name", "url", "color")
          .from("roadmaps")
          .where({
            id: roadmapId,
          })
          .first();

        response[i].boardId = undefined;
        response[i].roadmap_id = undefined;

        posts.push({
          ...response[i],
          board,
          roadmap,
          voters,
        });
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
      }
    }

    res.status(200).send({ posts });
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
