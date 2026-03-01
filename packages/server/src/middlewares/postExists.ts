import type { Request, Response, NextFunction } from "express";
import type {
  IDeletePostByIdRequestBody,
  IGetPostBySlugRequestBody,
  IUpdatePostRequestBody,
  IGetPostActivityRequestParam,
  IRemoveVoteRequestBody,
  IAddVoteRequestBody,
} from "@logchimp/types";
import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";

type RequestBody =
  | IGetPostBySlugRequestBody
  | IUpdatePostRequestBody
  | IDeletePostByIdRequestBody
  | IAddVoteRequestBody
  | IRemoveVoteRequestBody;

export async function postExists(
  req: Request<IGetPostActivityRequestParam, unknown, RequestBody>,
  res: Response,
  next: NextFunction,
) {
  const { id, slug } = getPostIdentifier(req);
  if (!id && !slug) {
    res.status(404).send({
      message: error.api.posts.postNotFound,
      code: "POST_NOT_FOUND",
    });
    return;
  }

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
    res.status(404).send({
      message: error.api.posts.postNotFound,
      code: "POST_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  req.post = post;
  next();
}

function getPostIdentifier(
  req: Request<IGetPostActivityRequestParam, unknown, RequestBody>,
): { id: string | null; slug: string | null } {
  let id: string | null = null;
  let slug: string | null = null;
  if ("id" in req.body) {
    id = (req.body.id || "").trim();
  }
  if ("postId" in req.body) {
    id = (req.body.postId || "").trim();
  }
  if ("post_id" in req.params) {
    id = (req.params.post_id || "").trim();
  }
  if (id) {
    id = validUUID(id);
  }

  if ("slug" in req.body) {
    slug = (req.body.slug || "").trim();
  }

  return {
    id,
    slug,
  };
}
