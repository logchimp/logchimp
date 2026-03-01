import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ISiteSettingsLab,
  IUpdatePostCommentRequestBody,
  IUpdatePostCommentRequestParam,
  IUpdatePostCommentResponseBody,
} from "@logchimp/types";
import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";

type ResponseBody = IUpdatePostCommentResponseBody | IApiErrorResponse;

export async function update(
  req: Request<
    IUpdatePostCommentRequestParam,
    unknown,
    IUpdatePostCommentRequestBody
  >,
  res: Response<ResponseBody>,
) {
  const { comment_id } = req.params;
  const { is_internal, is_spam } = req.body;
  const body = req.body.body;

  try {
    const labSettings = (await database
      .select(database.raw("labs::json"))
      .from("settings")
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
      return;
    }

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
