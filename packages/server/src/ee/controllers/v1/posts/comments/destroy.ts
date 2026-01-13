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
  const { comment_id } = req.params;

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

    await database.delete().from("posts_comments").where({ id: comment_id });

    res.status(204);
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
