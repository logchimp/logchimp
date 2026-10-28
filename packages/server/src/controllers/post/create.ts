import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  ICreatePostRequestBody,
  ICreatePostResponseBody,
  TPermission,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../database";

// utils
import logger from "../../utils/logger";

import error from "../../errorResponse.json";
import { createPostRequestBodySchema } from "./schema";
import { PostService } from "../../services/posts/post.service";

type ResponseBody =
  | ICreatePostResponseBody
  | IApiErrorResponse
  | IApiValidationErrorResponse;

const schemaBodyErrorMap = {};

export async function create(
  req: Request<unknown, unknown, ICreatePostRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const body = v.safeParse(createPostRequestBodySchema, req.body);
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

  const checkPermission = permissions.includes("post:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const postService = new PostService();

  const { title, description } = postService.titleDescriptionOverflow(
    body.output.title,
    body.output.contentMarkdown,
  );
  const { slug, slugId } = postService.generateSlug(title);

  try {
    const createPost = await database
      .insert({
        postId: uuidv4(),
        title,
        slug,
        slugId,
        contentMarkdown: description,
        userId,
      })
      .into("posts")
      .returning("*");

    const post = createPost[0];

    await database
      .insert({
        voteId: uuidv4(),
        userId,
        postId: post.postId,
      })
      .into("votes");

    res.status(201).send({
      post,
    });
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
