import type { Response, NextFunction } from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  IRoadmapPrivate,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../express";

import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";

type RequestParams = IGetRoadmapByUrlRequestParam;

export async function roadmapExists(
  req: ExpressRequestContext<RequestParams>,
  res: Response,
  next: NextFunction,
) {
  const id = validUUID(req.body.id);
  const url = req.params.url;

  const roadmap = await database<IRoadmapPrivate>("roadmaps")
    .select("id", "name", "display", "url", "color", "created_id", "index")
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

  req.ctx.roadmap = roadmap;
  next();
}
