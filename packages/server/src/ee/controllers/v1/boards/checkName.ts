import type { Request, Response } from "express";
import type { TBoardCheckNameBody, TPermission } from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

export async function checkName(
  req: Request<unknown, unknown, TBoardCheckNameBody>,
  res: Response,
) {
  logger.warning(
    "This API will be deprecated in the upcoming major release. Use `check-slug` instead",
  );
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const name = req.body.name;

  const checkPermission = permissions.includes("board:create");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  if (!name) {
    res.status(400).send({
      message: error.api.boards.nameMissing,
      code: "BOARD_NAME_MISSING",
    });
    return;
  }

  const slimUrl = name
    .replace(/[^\w]+/gi, "-")
    .trim()
    .toLowerCase();

  try {
    const board = await database
      .select()
      .from("boards")
      .where({
        url: slimUrl || null,
      })
      .first();

    res.status(200).send({ available: !board });
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
