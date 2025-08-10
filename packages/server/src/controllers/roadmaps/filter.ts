import database from "../../database";
import type { Request, Response } from "express";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { getUserFromRequest } from "src/utils/getUserFromRequest";
import { computePermissions } from "../../utils/computePermissions";

export async function filter(req: Request, res: Response) {
  try {
    const decoded = getUserFromRequest(req);

    let roadmapsQuery = database
      .select("id", "name", "url", "color", "display", "index")
      .from("roadmaps")
      .orderBy("index", "asc");

    // If the user is not logged in, they can only see public roadmaps
    if (!decoded) {
      const roadmaps = await roadmapsQuery.where({ display: true });
      return res.status(200).send({ roadmaps });
    }

    // If the user is logged in, check their permissions
    //@ts-ignore
    const userId = decoded.userId;

    const user = await database
      .select(
        "u.userId",
        "u.isOwner",
        "u.isBlocked",
        database.raw("ARRAY_AGG(r.id) AS roles"),
      )
      .from("users AS u")
      .leftJoin("roles_users AS ru", "u.userId", "ru.user_id")
      .leftJoin("roles AS r", "ru.role_id", "r.id")
      .groupBy("u.userId")
      .where("u.userId", userId)
      .first();

    const permissions = await computePermissions(user);
    let withPermissions = true;

    if (!permissions.includes("roadmap:read")) {
      roadmapsQuery = roadmapsQuery.where({ display: true });
      withPermissions = false;
    }

    const roadmaps = await roadmapsQuery;
    res.status(200).send({ roadmaps, withPermissions });
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
