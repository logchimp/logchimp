import type { Request, Response } from "express";
import database from "../../../../database";
import type { components } from "@logchimp/api-ts-types";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | components["schemas"]["CheckBoardSlugResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function checkSlug(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["CheckBoardSlugRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

  const slugUrl = req.body.url;

  const checkPermission =
    permissions.includes("board:create") ||
    permissions.includes("board:update");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  if (!slugUrl) {
    res.status(400).send({
      message: error.api.boards.urlMissing,
      code: "BOARD_URL_MISSING",
    });
    return;
  }

  const slimUrl = slugUrl
    .replace(/[^\w]+/gi, "-")
    .trim()
    .toLowerCase();

  try {
    const board = await database
      .select<{ boardId: string }>("boardId")
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
