import type { Request, Response } from "express";
import database from "../../../database";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";
import { BodySchema } from "../zodValidation";

export async function update(req: Request, res: Response) {
  const { comment_id } = req.params;
  // const { body, is_internal, is_spam } = req.body;
  const response = BodySchema.safeParse(req.body);
  if(!response.success){
    return res.status(400).json({
      message:error.api.error.missed,
      success:false,
    })
  }
  try {
    const labSettings = await database
      .select(database.raw("labs::json"))
      .from("settings")
      .first();

    // @ts-ignore
    if (!labSettings.labs.comments) {
      return res.status(403).send({
        message: error.api.labs.disabled,
        code: "LABS_DISABLED",
      });
    }

    const comment = await database
      .update({
        body,
        is_internal,
        is_edited: true,
        is_spam,
        created_at: new Date().toJSON(),
        updated_at: new Date().toJSON(),
      })
      .from("posts_comments")
      .where({ id: comment_id })
      .returning("*");

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
