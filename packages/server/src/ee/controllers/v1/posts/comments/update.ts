import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdatePostCommentRequestBody,
  IUpdatePostCommentRequestParam,
  IUpdatePostCommentResponseBody,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../../../../database";
import {
  upsertCommentRequestBodyErrorMap as requestBodyErrorMap,
  upsertCommentRequestBodySchema as requestBodySchema
} from "./utils";
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import { isFeatureEnabled } from "../../../../services/settings/labs";

type ResponseBody = IUpdatePostCommentResponseBody | IApiErrorResponse;

/**
 * Comment delete endpoint.
 *
 * `post_id` param and `comment_id` param are validated in their respective middlewares.
 */
export async function update(
  req: Request<
    IUpdatePostCommentRequestParam,
    unknown,
    IUpdatePostCommentRequestBody
  >,
  res: Response<ResponseBody>,
) {
  const { comment_id } = req.params;

  const isCommentsEnabled = await isFeatureEnabled("comments");
  if (!isCommentsEnabled) {
    res.status(403).send({
      message: error.api.labs.disabled,
      code: "LABS_DISABLED",
    });
    return;
  }

  const reqBody = v.safeParse(requestBodySchema, req.body);
  if (!reqBody.success) {
    res.status(400).json({
      message: "Invalid request body",
      code: "VALIDATION_ERROR",
      errors: reqBody.issues.map((issue) => ({
        ...issue,
        message: requestBodyErrorMap[issue.message]
          ? requestBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  try {
    // @ts-expect-error
    const userId = req.user.userId;

    const isAuthor = await database
      .from("posts_activity")
      .where({
        type: "comment",
        posts_comments_id: comment_id,
        author_id: userId,
      })
      .first();

    if (!isAuthor) {
      res.status(403).send({
        message: error.api.comments.notAnAuthor,
        code: "UNAUTHORIZED_NOT_AUTHOR",
      });
      return;
    }

    const comment = await database
      .update({
        body,
        is_internal,
        is_edited: true,
        is_spam,
        updated_at: new Date().toJSON(),
      })
      .from("posts_comments")
      .where({ id: comment_id })
      .returning([
        "id",
        "body",
        "is_internal",
        "is_edited",
        "is_spam",
        "parent_id",
        "created_at",
        "updated_at",
      ]);

    res.status(200).send({
      comment: comment[0],
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
