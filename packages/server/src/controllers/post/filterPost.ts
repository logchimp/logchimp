import type { Request, Response } from "express";
import { z } from "zod";
import type {
  IApiErrorResponse,
  IFilterPostRequestBody,
  IFilterPostResponseBody,
} from "@logchimp/types";
import database from "../../database";

// services
import { getBoardById } from "../../ee/services/boards/getBoardById";
import { getVotes } from "../../services/votes/getVotes";

// utils
import {
  parseAndValidateLimit,
  parseAndValidatePage,
  validUUID,
  validUUIDs,
} from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { GET_POSTS_FILTER_COUNT } from "../../constants";

const querySchema = z.object({
  first: z.coerce
    .string()
    .transform((value) => parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT)),
  page: z.coerce
    .string()
    .optional()
    .transform((value) => (value ? parseAndValidatePage(value) : undefined)),
  limit: z.coerce
    .string()
    .optional()
    .transform((value) => parseAndValidateLimit(value, GET_POSTS_FILTER_COUNT)),
  after: z.uuid().optional(),
  created: z.enum(["ASC", "DESC"]).default("DESC"),
});

type ResponseBody = IFilterPostResponseBody | IApiErrorResponse;

export async function filterPost(
  req: Request<unknown, unknown, IFilterPostRequestBody>,
  res: Response<ResponseBody>,
) {
  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
      errors: query.error.issues,
    });
  }
  const { after, first, page, limit, created } = query.data;
  const boardId = validUUIDs(req.body.boardId || []);
  const roadmapId = validUUID(req.body.roadmapId);
  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  try {
    let sql = `
        SELECT
          "postId",
          "title",
          "slug",
          "boardId",
          "roadmap_id",
          "contentMarkdown",
          "createdAt",
          "updatedAt"
        FROM
          posts
    `;
    const conditions: string[] = [];

    if (boardId.length > 0) {
      conditions.push(
        `"boardId" IN (${boardId.map((id) => `'${id}'`).join(",")})`,
      );
    }
    if (roadmapId) {
      conditions.push(`"roadmap_id" = :roadmapId`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")} `;
    }

    if (after) {
      // Fetch posts after a specific cursor (createdAt of that post)
      const cursorPost = await database("posts")
        .select("createdAt")
        .where({ postId: after })
        .first();

      if (cursorPost) {
        sql += conditions.length > 0 ? " AND " : " WHERE ";
        sql += `"createdAt" ${created === "ASC" ? ">" : "<"} :cursorCreatedAt `;
      }
    }

    sql += ` ORDER BY "createdAt" ${created} `;

    if (after) {
      sql += ` LIMIT :limit `;
    } else {
      // offset-based pagination
      sql += ` LIMIT :limit OFFSET :offset `;
    }
    const bindings: Record<string, any> = {
      limit: limit ?? first,
      offset: page ? (limit ?? first) * (page - 1) : 0,
      roadmapId,
    };

    if (after) {
      const cursorPost = await database("posts")
        .select("createdAt")
        .where({ postId: after })
        .first();
      if (cursorPost) {
        bindings.cursorCreatedAt = cursorPost.createdAt;
      }
    }

    const { rows: response } = await database.raw(sql, bindings);

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
