import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IComment,
  IUpdatePostCommentRequestBody,
  IUpdatePostCommentRequestParam,
  IUpdatePostCommentResponseBody,
  TPermission,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../../../../database";
import {
  upsertCommentRequestBodyErrorMap as requestBodyErrorMap,
  upsertCommentRequestBodySchema as requestBodySchema,
} from "./utils";
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import type { GetCommentStatement } from "../../../../middleware/commentExists";

type ResponseBody = IUpdatePostCommentResponseBody | IApiErrorResponse;

/**
 * Comment update endpoint.
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

  // @ts-expect-error
  const comment = req?.comment as GetCommentStatement | undefined;
  if (!comment) {
    res.status(404).send({
      message: error.api.comments.commentNotFound,
      code: "COMMENT_NOT_FOUND",
    });
    return;
  }

  // @ts-expect-error
  const subscription = req?.subscription;
  if (!(subscription?.hierarchy >= (comment.is_internal ? 2 : 1))) {
    res.status(403).send({
      message: error.middleware.license.higherPlan,
      code: "LICENSE_INSUFFICIENT_TIER",
    });
    return;
  }

  // @ts-expect-error
  const userId = req.user.userId;

  // @ts-expect-error
  const permissions = (req.user?.permissions || []) as TPermission[];
  const requiredPermission = [
    "comment:update:own",
    "comment:update:any",
  ] satisfies TPermission[];
  const hasPermission = requiredPermission.some((permission) =>
    permissions.includes(permission),
  );
  if (!hasPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const ownComment = permissions.includes(
    "comment:update:own" satisfies TPermission,
  );
  if (ownComment) {
    let isAuthor: {
      id: string;
    };
    try {
      isAuthor = await database
        .select<{
          id: string;
        }>("id")
        .from("posts_activity")
        .where({
          type: "comment",
          posts_comments_id: comment_id,
          author_id: userId,
        })
        .first();
    } catch (err) {
      logger.log({
        level: "error",
        message: "failed to check if user is author of comment",
        err,
      });
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return;
    }

    if (!isAuthor?.id) {
      res.status(403).send({
        message: error.api.comments.notAnAuthor,
        code: "UNAUTHORIZED_NOT_AUTHOR",
      });
      return;
    }
  }

  try {
    const comment = await commentUpdateStatement({
      comment_id,
      is_internal: reqBody.output.is_internal,
      is_spam: reqBody.output.is_spam,
      body: reqBody.output.body,
    });

    res.status(200).send({
      comment: comment,
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

interface IUpdateCommentStmt {
  comment_id: string;
  is_internal: boolean;
  is_spam: boolean;
  body: string;
}

async function commentUpdateStatement({
  comment_id,
  is_internal,
  is_spam,
  body,
}: IUpdateCommentStmt) {
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
    .returning<Array<IComment>>([
      "id",
      "body",
      "is_internal",
      "is_edited",
      "is_spam",
      "parent_id",
      "created_at",
      "updated_at",
    ]);

  if (comment.length === 0) {
    throw new Error("Comment failed to update in database");
  }

  return comment[0];
}
