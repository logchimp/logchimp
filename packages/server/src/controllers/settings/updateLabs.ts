import type { Request, Response } from "express";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

/**
 * This API doesn't update the existing labs value
 * instead overrides the existing value with req.body.labs
 */
export async function updateLabs(req: Request, res: Response) {
  // @ts-ignore
  const permissions = req.user.permissions;

  const labs = req.body;
  const stringify = JSON.stringify(labs);

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      // @ts-ignore
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  try {
    const response = await database
      .update({
        labs: database.raw(`labs::jsonb || '${stringify}'`),
      })
      .from("settings")
      .returning(database.raw("labs::json"));

    const labs = response[0];
    res.status(200).send({
      labs,
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
