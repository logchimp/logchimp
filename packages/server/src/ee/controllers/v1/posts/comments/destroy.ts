import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ISiteSettingsLab,
  TDeletePostCommentRequestParam,
} from "@logchimp/types";
import database from "../../../../../database";

// utils
import logger from "../../../../../utils/logger";
import error from "../../../../../errorResponse.json";

export async function destroy(
  req: Request<TDeletePostCommentRequestParam>,
  res: Response<IApiErrorResponse>,
) {
  const { comment_id, post_id } = req.params;

  try {
    const labSettings = (await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first()) as unknown as { labs: ISiteSettingsLab };

    if (!labSettings.labs.comments) {
      return res.status(403).send({
        message: error.api.labs.disabled,
        code: "LABS_DISABLED",
      });
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
      return res.status(403).send({
        message: error.api.comments.notAnAuthor,
        code: "UNAUTHORIZED_NOT_AUTHOR",
      });
    }

    await database.delete().from("posts_activity").where({
      post_id: post_id,
      posts_comments_id: comment_id,
    });
    await database.delete().from("posts_comments").where({ id: comment_id });

    res.sendStatus(204);
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
