import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ISearchBoardRequestParams,
  ISearchBoardResponseBody,
  TPermission,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = ISearchBoardResponseBody | IApiErrorResponse;

export async function searchBoard(
  req: Request<ISearchBoardRequestParams>,
  res: Response<ResponseBody>,
) {
  const { name } = req.params;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("board:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  try {
    const boards = await database
      .select(
        "boards.boardId",
        "boards.name",
        "boards.color",
        "boards.url",
        "boards.display",
        "boards.view_voters",
        "boards.createdAt",
      )
      .count("posts", { as: "post_count" })
      .leftJoin("posts", "boards.boardId", "posts.boardId")
      .from("boards")
      .where("name", "ILIKE", `${name}%`)
      .groupBy("boards.boardId");

    res.status(200).send({
      boards,
    });
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
