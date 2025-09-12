import type { Request, Response, NextFunction } from "express";
import type {
  IApiErrorResponse,
  IGetCommentRequestParam,
} from "@logchimp/types";
import database from "../../database";

// utils
import error from "../../errorResponse.json";
import { validUUID } from "../../helpers";

export async function commentExists(
  req: Request<IGetCommentRequestParam>,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const id = validUUID(req.params.comment_id);

  const comment = await database
    .select()
    .from("posts_comments")
    .where({
      id: id || null,
    })
    .first();

  if (!comment) {
    return res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
  }

  // @ts-expect-error
  req.comment = comment;
  next();
}
