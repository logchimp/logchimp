import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IFilterPostRequestBody,
  IFilterPostResponseBody,
  IPost,
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
import { getUserPublicInfo } from "../../services/users/getUsers";

type ResponseBody = IFilterPostResponseBody | IApiErrorResponse;

export async function filterPost(
  req: Request<unknown, unknown, IFilterPostRequestBody>,
  res: Response<ResponseBody>,
) {
  const boardId = validUUIDs(req.body.boardId || []);
  const roadmapId = validUUID(req.body.roadmapId);
  /**
   * top, latest, oldest, trending
   */
  const created = req.body.created || "DESC";
  const limit = parseAndValidateLimit(req.body?.limit, GET_POSTS_FILTER_COUNT);
  const page = parseAndValidatePage(req.body?.page);

  // @ts-expect-error
  const userId: string | undefined = req.user?.userId;

  try {
    const response = await getPostsQuery({
      boardId,
      roadmapId,
      created,
      limit,
      offset: (page - 1) * limit,
    });

    const posts: IPost[] = [];

    for (let i = 0; i < response.length; i++) {
      const postId = response[i].postId;
      const boardId = response[i].boardId;
      const roadmapId = response[i].roadmap_id;

      try {
        const board = await getBoardById(boardId);
        const voters = await getVotes(postId, userId);
        const roadmap = await database
          .select<{
            id: string;
            name: string;
            url: string;
            color: string;
          }>("id", "name", "url", "color")
          .from("roadmaps")
          .where({
            id: roadmapId,
          })
          .first();
        const author = await getUserPublicInfo(response[i].userId);

        response[i].boardId = undefined;
        response[i].roadmap_id = undefined;
        response[i].userId = undefined;

        posts.push({
          ...response[i],
          author,
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

interface IGetPostDatabaseResponse {
  postId: string;
  title: string;
  slug: string;
  userId: string;
  boardId: string | null;
  roadmap_id: string | null;
  contentMarkdown: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IGetPostArguments {
  boardId: string[];
  roadmapId?: string;
  created?: "ASC" | "DESC";
  limit: number;
  offset: number;
}

function getPostsQuery({
  boardId,
  roadmapId,
  created,
  limit,
  offset,
}: IGetPostArguments) {
  const query = database
    .select<Array<IGetPostDatabaseResponse>>(
      "postId",
      "title",
      "slug",
      "userId",
      "boardId",
      "roadmap_id",
      "contentMarkdown",
      "createdAt",
      "updatedAt",
    )
    .from("posts")
    .orderBy("createdAt", created)
    .limit(limit)
    .offset(offset);

  if (boardId.length > 0) {
    query.whereIn("boardId", boardId);
  }
  if (roadmapId) {
    query.where("roadmap_id", roadmapId);
  }

  return query;
}
