import type { Request, Response, NextFunction } from "express";
import type {
  IApiErrorResponse,
  IGetRoadmapByUrlRequestParam,
  IRoadmapPrivate,
} from "@logchimp/types";

import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";
import logger from "../utils/logger";

type RequestParams = Partial<IGetRoadmapByUrlRequestParam>;

export async function roadmapExists(
  req: Request<RequestParams>,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const id = validUUID(req.body.id);
  const url = req.params.url;

  if (!id && !url) {
    res.status(404).send({
      message: error.api.roadmaps.roadmapNotFound,
      code: "ROADMAP_ID_OR_URL_MISSING",
    });
    return;
  }

  try {
    const roadmap = await database<IRoadmapPrivate>("roadmaps")
      .select("id", "name", "display", "url", "color", "created_at", "index")
      .where((builder) => {
        if (id) builder.where("id", id);
        if (url) builder.orWhere("url", url);
      })
      .first();

    if (!roadmap) {
      res.status(404).send({
        message: error.api.roadmaps.roadmapNotFound,
        code: "ROADMAP_NOT_FOUND",
      });
      return;
    }

    // @ts-expect-error
    req.roadmap = roadmap;
    next();
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
