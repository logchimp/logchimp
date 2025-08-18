import type { Request, Response } from "express";
import database from "../../database";

// services
import { getBoardById } from "../../services/boards/getBoardById";
import { getVotes } from "../../services/votes/getVotes";

// utils
import { validUUID, validUUIDs } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { queryPostsSchema } from "./zodValidation";

export async function filterPost(req: Request, res: Response) {

  const response = queryPostsSchema.safeParse(req.body);
  if(!response.success){
    return res.status(400).json({
      message:error.api.error.missed,
    })
  }

  const {userid, boardid, roadmapid, create, pages, limits} = response.data || req.body
  
  const userId = validUUID(userid);
  const boardId = validUUIDs(boardid);
  const roadmapId = validUUID(roadmapid);
  /**
   * top, latest, oldest, trending
   */
  const created = create;
  const page = pages - 1;
  const limit = limits || 10;

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
