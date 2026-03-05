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
import { toTrimmedString, validUUID } from "../helpers";
import error from "../errorResponse.json";
import logger from "../utils/logger";

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

  let post: GetPostStatement | undefined;
  try {
    post = await getPostStatement({ id, slug });
  } catch (e) {
    logger.error({
      message: "failed to get post from db",
      error: e,
    });
    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return;
  }

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
    id = toTrimmedString(req.body.id);
  }
  if ("postId" in req.body) {
    id = toTrimmedString(req.body.postId);
  }
  if ("post_id" in req.params) {
    id = toTrimmedString(req.params.post_id);
  }
  if (id) {
    id = validUUID(id);
  }

  if ("slug" in req.body) {
    slug = toTrimmedString(req.body.slug);
  }

  return {
    id,
    slug,
  };
}

interface GetPostArgs {
  id: string | null;
  slug: string | null;
}

interface GetPostStatement {
  postId: string;
  title: string;
  slug: string;
  slugId: string;
  contentMarkdown: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  boardId: string | null;
  roadmap_id: string | null;
}

/**
 * Retrieves a post statement from the database based on the provided arguments.
 *
 * @param {Object} args - The arguments to filter the post query.
 * @param {string} [args.id] - The unique identifier of the post.
 * @param {string} [args.slug] - The slug of the post.
 * @return {Promise<GetPostStatement | undefined>} A promise containing the post statement or `undefined` if no match is found.
 */
function getPostStatement({ id, slug }: GetPostArgs): Promise<GetPostStatement | undefined> {
  const query = database.select<GetPostStatement>().from("posts");

  if (id) {
    return query.where({ postId: id }).first();
  }

  if (slug) {
    return query.where({ slug }).first();
  }

  return Promise.resolve(undefined);
}
