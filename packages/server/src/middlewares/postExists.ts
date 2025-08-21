import type { Request, Response, NextFunction } from "express";
import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";

export async function postExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = validUUID(req.body.id);
  const slug = req.body.slug;

  const post = await database
    .select()
    .from("posts")
    .where({
      postId: id || null,
    })
    .orWhere({
      slug: slug || null,
    })
    .first();

  if (!post) {
    return res.status(404).send({
      message: error.api.posts.postNotFound,
      code: "POST_NOT_FOUND",
    });
  }

  // @ts-expect-error
  req.post = post;
  next();
}
