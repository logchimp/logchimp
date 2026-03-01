import type { NextFunction, Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdatePostCommentRequestParam,
  TDeletePostCommentRequestParam,
} from "@logchimp/types";
import database from "../../database";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

type RequestParam =
  | IUpdatePostCommentRequestParam
  | TDeletePostCommentRequestParam;

export async function commentExists(
  req: Request<RequestParam>,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const id = validUUID(req.params.comment_id);

  if (!id) {
    res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
    return;
  }

  const comment = await database("posts_comments as pc")
    .leftJoin("posts_activity as pa", "pa.posts_comments_id", "pc.id")
    .select<{
      id: string;
      parent_id: string | null;
      activity_id: string;
      body: string;
      is_edited: boolean;
      is_spam: boolean;
      is_internal: boolean;
      created_at: Date;
      updated_at: Date;
      post_id: string | null;
    }>([
      "pc.id",
      "pc.parent_id",
      "pc.activity_id",
      "pc.body",
      "pc.is_edited",
      "pc.is_spam",
      "pc.is_internal",
      "pc.created_at",
      "pc.updated_at",
      "pa.post_id",
    ])
    .where("pc.id", "=", id || null)
    .first();

  if (!comment) {
    res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  const post = req.post;
  if (!post || comment.post_id !== post.postId) {
    res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  req.comment = comment;
  next();
}
