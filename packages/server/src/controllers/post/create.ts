import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  ICreatePostRequestBody,
  ICreatePostResponseBody,
  TPermission,
} from "@logchimp/types";
import xss from "xss";
import { POST_TITLE_MAX_LENGTH } from "../../constants";
import * as v from "valibot";

import database from "../../database";

// utils
import { generateNanoID as nanoid } from "../../helpers";
import logger from "../../utils/logger";

import error from "../../errorResponse.json";
import { createPostRequestBodySchema } from "./schema";

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

  let title = xss(body.output.title);
  let contentMarkdown = xss(body.output.contentMarkdown);

  if (title.length > POST_TITLE_MAX_LENGTH) {
    const exceedingText = title.slice(POST_TITLE_MAX_LENGTH - 3);
    title = `${title.slice(0, POST_TITLE_MAX_LENGTH - 3)}...`;

    contentMarkdown = `...${exceedingText}${contentMarkdown ? `\n\n${contentMarkdown}` : ""}`;
  }

  const checkPermission = permissions.includes("post:create");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  // generate slug unique identification
  const slugId = nanoid(20);

  const slug = `${title
    .replace(/[^\w\s]/gi, "")
    .replace(/\s\s+/gi, " ")
    .toLowerCase()
    .split(" ")
    .join("-")}-${slugId}`;

  try {
    const createPost = await database
      .insert({
        postId: uuidv4(),
        title,
        slug,
        slugId,
        contentMarkdown,
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
