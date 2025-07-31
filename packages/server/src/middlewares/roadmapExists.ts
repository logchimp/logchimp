import database from "../database";

// utils
import { validUUID } from "../helpers";
import error from "../errorResponse.json";

export async function roadmapExists(req, res, next) {
  const id = validUUID(req.body.id);
  const url = req.params.url;

  const roadmap = await database
    .select()
    .from("roadmaps")
    .where({
      id: id || null,
    })
    .orWhere({
      url: url || null,
    })
    .first();

  if (!roadmap) {
    return res.status(404).send({
      message: error.api.roadmaps.roadmapNotFound,
      code: "ROADMAP_NOT_FOUND",
    });
  }

  req.roadmap = roadmap;
  next();
}
