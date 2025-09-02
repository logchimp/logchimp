import type { Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  IRoadmapPrivate,
  IUpdateRoadmapRequestBody,
  TUpdateRoadmapResponseBody,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../../../../express";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | TUpdateRoadmapResponseBody
  | IApiValidationErrorResponse
  | IApiErrorResponse;

export async function updateRoadmap(
  req: ExpressRequestContext<unknown, unknown, IUpdateRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  const id = req.ctx.roadmap.id;

  const { name, url, color, display } = req.body;

  if (!url) {
    return res.status(400).send({
      errors: [
        url
          ? undefined
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
      .returning<IRoadmapPrivate[]>([
        "id",
        "name",
        "url",
        "color",
        "index",
        "display",
        "created_at",
      ]);

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
