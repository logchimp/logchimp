import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import type {
  IApiErrorResponse,
  ICreatePostCommentRequestBody,
  TCreatePostCommentRequestParam,
  ICreatePostCommentResponseBody,
  IPublicUserInfo,
  ISiteSettingsLab,
} from "@logchimp/types";

import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";
import { validUUID } from "../../../../../helpers";

type ResponseBody = ICreatePostCommentResponseBody | IApiErrorResponse;

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
  let parent_id = validUUID(req.body.parent_id);
  const is_internal = req.body.is_internal;
  const body = req.body.body;

  // check auth user has required permission to set comment as internal
  // check the auth user has permission to comment

  try {
    const labSettings = (await database("settings")
      .select(database.raw("labs::json"))
      .first()) as unknown as { labs: ISiteSettingsLab };

    if (!labSettings.labs.comments) {
      res.status(403).send({
        message: error.api.labs.disabled,
        code: "LABS_DISABLED",
      });
      return;
    }

    if (!body) {
      res.status(400).send({
        message: error.api.comments.bodyMissing,
        code: "COMMENT_BODY_MISSING",
      });
      return
    }

    const results = await database.transaction(async (trx) => {
      // postActivityId will be shared b/w "posts_comments" and "posts_activity" table
      const postActivityId = uuid();

      // checking if the parent comment exists
      const parent_comment = await trx
        .from("posts_comments")
        .where({
          id: parent_id || null,
        })
        .first();

      if (!parent_comment) {
        parent_id = null;
      }

      const comments = await trx("posts_comments").insert(
        {
          id: uuid(),
          parent_id,
          body,
          activity_id: postActivityId,
          is_internal,
          created_at: new Date().toJSON(),
          updated_at: new Date().toJSON(),
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
      );

      const comment = comments[0];

      const activities = await trx("posts_activity")
        .insert({
          id: postActivityId,
          type: "comment",
          posts_comments_id: comment.id,
          post_id,
          author_id: userId,
          created_at: new Date().toJSON(),
        })
        .returning(["id", "type", "created_at"]);

      const activity = activities[0];

      const author = await trx<IPublicUserInfo>("users")
        .select("userId", "name", "username", "avatar")
        .where({ userId })
        .first();

      return {
        ...activity,
        comment,
        author,
      };
    });

    res.status(201).send({
      comment: results,
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
