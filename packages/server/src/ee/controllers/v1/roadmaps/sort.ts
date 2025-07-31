import type { Request, Response } from "express";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function sort(req: Request, res: Response) {
  const { from, to } = req.body;
  // @ts-ignore
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    // to
    await database
      .update({
        index: to.index,
      })
      .from("roadmaps")
      .where({
        id: to.id,
      });

    // from
    await database
      .update({
        index: from.index,
      })
      .from("roadmaps")
      .where({
        id: from.id,
      });

    res.sendStatus(200);
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
