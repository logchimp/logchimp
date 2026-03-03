import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import type {
  IApiErrorResponse,
  ICreatePostCommentRequestBody,
  TCreatePostCommentRequestParam,
  ICreatePostCommentResponseBody,
  IPublicUserInfo,
  IComment,
  TPostActivityType,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../../../../database";
import {
  upsertCommentRequestBodySchema,
  upsertCommentRequestBodyErrorMap as requestBodyErrorMap
} from "./utils";
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import { validUUID } from "../../../../../helpers";
import { isFeatureEnabled } from "../../../../services/settings/labs";

type ResponseBody = ICreatePostCommentResponseBody | IApiErrorResponse;

const { is_spam, ...upsertCommentRequestBodySchemaRest } = upsertCommentRequestBodySchema.entries;
const requestBodySchema = v.object({
  ...upsertCommentRequestBodySchemaRest,
  parent_id: v.optional(v.pipe(v.string(), v.transform(validUUID))),
})

/**
 * Comment create controller
 *
 * `post_id` param are validated in postExists middleware.
 */
export async function create(
  req: Request<
    TCreatePostCommentRequestParam,
    unknown,
    ICreatePostCommentRequestBody
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const userId = req.user.userId;
  const { post_id } = req.params;

  // check auth user has required permission to set comment as internal
  // check the auth user has permission to comment

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
    const parentCommentId = await parentCommentExists({
      parentId: reqBody.output.parent_id,
      postId: post_id,
    });

    const results = await createCommentStatement({
      parentId: parentCommentId,
      isInternal: reqBody.output.is_internal,
      body: reqBody.output.body,
      postId: post_id,
      userId,
    });

    res.status(201).send({
      activity: results,
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

interface ParentCommentExists {
  parentId: string | null;
  postId: string;
}

const parentCommentExists = async ({
  parentId: _parentId,
  postId: _postId,
}: ParentCommentExists): Promise<string | null> => {
  if (!_parentId) {
    return null;
  }

  const parentExists = await database("posts_comments as pc")
    .leftJoin("posts_activity as pa", "pa.posts_comments_id", "pc.id")
    .select<{
      id: string;
      post_id: string;
    }>("pc.id", "pa.post_id")
    .where("pc.id", "=", _parentId)
    .first();

  if (!parentExists || parentExists?.post_id !== _postId) {
    return null;
  }

  return parentExists.id;
};

interface ICreateCommentStmt {
  parentId: string | null;
  isInternal: boolean;
  postId: string;
  userId: string;
  body: string;
}

const createCommentStatement = ({
  parentId,
  isInternal,
  body,
  postId,
  userId,
}: ICreateCommentStmt) =>
  database.transaction(async (trx) => {
    const now = new Date().toJSON();
    // postActivityId will be shared b/w "posts_comments" and "posts_activity" table
    const postActivityId = uuid();

    const [comment] = await trx("posts_comments")
      .insert(
        {
          id: uuid(),
          parent_id: parentId,
          body,
          activity_id: postActivityId,
          is_internal: isInternal,
          created_at: now,
          updated_at: now,
        },
        [
          "id",
          "parent_id",
          "body",
          "is_internal",
          "is_edited",
          "is_spam",
          "created_at",
        ],
      )
      .returning<IComment[]>([
        "id",
        "parent_id",
        "body",
        "is_internal",
        "is_edited",
        "is_spam",
        "created_at",
        "updated_at",
      ]);

    if (!comment) {
      throw new Error("Failed to create comment in database");
    }

    const [[activity], author] = await Promise.all([
      trx("posts_activity")
        .insert({
          id: postActivityId,
          type: "comment",
          posts_comments_id: comment.id,
          post_id: postId,
          author_id: userId,
          created_at: now,
        })
        .returning<
          {
            id: string;
            type: TPostActivityType;
            created_at: Date;
          }[]
        >(["id", "type", "created_at"]),
      trx("users")
        .select<IPublicUserInfo>("userId", "name", "username", "avatar")
        .where({ userId })
        .first(),
    ]);

    if (!activity) {
      throw new Error("Failed to create activity record in database");
    }

    if (!author) {
      throw new Error(`User with id ${userId} does not exist`);
    }

    return {
      ...activity,
      comment,
      author,
    };
  });
