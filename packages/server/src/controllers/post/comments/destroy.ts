import type { Request, Response } from "express";
import database from "../../../database";

// utils
import logger from "../../../utils/logger";
import error from "../../../errorResponse.json";

export async function destroy(req: Request, res: Response) {
  const { comment_id } = req.params;

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

    await database.delete().from("posts_comments").where({ id: comment_id });

    res.status(204).json({
      message:"like delete successfully",
      success:true,
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
