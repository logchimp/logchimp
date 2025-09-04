import type { Request, Response } from "express";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

export async function updateLogo(req: Request, res: Response) {
  const host = req.headers.host;
  // @ts-expect-error
  const imagePath = req.file.path.split("content/images")[1];

  const imageUrl = `//${host}/content/images${imagePath}`;

  try {
    const updatedSettings = await database
      .update({
        logo: imageUrl,
      })
      .from("settings")
      .returning("*");

    res.status(200).send({
      settings: updatedSettings[0],
    });
  } catch (err) {
    logger.error({
      code: "DASHBOARD_SETTINGS_UPDATE",
      message: "Update logo",
      err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
