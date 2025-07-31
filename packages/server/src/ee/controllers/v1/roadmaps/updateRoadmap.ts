import type { Request, Response } from "express";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function updateRoadmap(req: Request, res: Response) {
  // @ts-ignore
  const id = req.roadmap.id;

  const { name, url, color, display } = req.body;

  if (!url) {
    return res.status(400).send({
      errors: [
        url
          ? ""
          : {
              message: error.api.roadmaps.urlMissing,
              code: "ROADMAP_URL_MISSING",
            },
      ],
    });
  }

  const slimUrl = url.replace(/\W+/gi, "-").trim().toLowerCase();

  try {
    const roadmaps = await database
      .update({
        name,
        url: slimUrl,
        color,
        display,
        updated_at: new Date().toJSON(),
      })
      .from("roadmaps")
      .where({
        id,
      })
      .returning("*");

    const roadmap = roadmaps[0];

    res.status(200).send({ roadmap });
  } catch (err) {
    logger.error({
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
