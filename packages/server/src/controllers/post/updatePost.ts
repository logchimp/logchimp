import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdatePostRequestBody,
  TPermission,
  TUpdatePostResponseBody,
} from "@logchimp/types";
import * as v from "valibot";
import xss from "xss";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { updatePostRequestBodySchema } from "./schema";
import type { GetPostStatement } from "../../middlewares/postExists";
import { PostService } from "../../services/posts/post.service";

type ResponseBody = TUpdatePostResponseBody | IApiErrorResponse;

const schemaBodyErrorMap = {
  POST_TITLE_MISSING: error.api.posts.titleMissing,
};

export async function updatePost(
  req: Request<unknown, unknown, IUpdatePostRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
  // @ts-expect-error
  const postId = (req.post as GetPostStatement).postId;
  // @ts-expect-error
  const authorId = (req.post as GetPostStatement).userId;
  // @ts-expect-error
  const slugId = (req.post as GetPostStatement).slugId;

  const checkPermission = permissions.includes("post:update");
  if (!checkPermission && userId !== authorId) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const body = v.safeParse(updatePostRequestBodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: schemaBodyErrorMap[issue.message]
          ? schemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const { title: rawTitle, contentMarkdown: rawContentMarkdown } = body.output;
  const title = xss((String(rawTitle) || "").trim());
  const contentMarkdown = xss(String(rawContentMarkdown || "").trim()) || null;

  const postService = new PostService();
  const { slug } = postService.generateSlug(title, slugId);

  try {
    const posts = await database
      .update({
        title,
        slug,
        contentMarkdown,
        updatedAt: new Date().toJSON(),
      })
      .from("posts")
      .where({
        postId,
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
