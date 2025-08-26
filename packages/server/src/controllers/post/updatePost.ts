import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdatePostRequestBody,
  TUpdatePostResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import { validUUID } from "../../helpers";
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = TUpdatePostResponseBody | IApiErrorResponse;

export async function updatePost(
  req: Request<unknown, unknown, IUpdatePostRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const permissions = req.user.permissions;
  // @ts-ignore
  const authorId = req.post.userId;
  // @ts-ignore
  const slugId = req.post.slugId;

  const id = validUUID(req.body.id);
  const title = req.body.title;
  const contentMarkdown = req.body.contentMarkdown;
  const boardId = validUUID(req.body.boardId) || undefined;
  const roadmapId = validUUID(req.body.roadmapId) || undefined;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const posts = await database
      .update({
        title,
        slug,
        contentMarkdown,
        boardId,
        roadmap_id: roadmapId,
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId: id,
      })
      .returning("*");

    const post = posts[0];

    res.status(200).send({ post });
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
