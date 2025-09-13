import type { Request, Response, NextFunction } from "express";
import type {
  IDeletePostByIdRequestBody,
  IGetPostBySlugRequestBody,
  IUpdatePostRequestBody,
} from "@logchimp/types";
import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";

type RequestBody =
  | IGetPostBySlugRequestBody
  | IUpdatePostRequestBody
  | IDeletePostByIdRequestBody;

export async function postExists(
  req: Request<RequestBody>,
  res: Response,
  next: NextFunction,
) {
  const id = validUUID(req.body.id || req.body.postId);
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
