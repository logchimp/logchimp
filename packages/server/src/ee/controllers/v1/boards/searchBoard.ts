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
  const name = (req.params?.name || "").trim();
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

  const escaped = name.replace(/[\\%_]/g, "\\$&");

  const query = database
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
    .groupBy("boards.boardId")
    .orderByRaw(
      `CASE
        WHEN lower(boards.name) = lower(?) THEN 0
        WHEN boards.name ILIKE ? THEN 1
        ELSE 2
      END
    `,
      [name, `${escaped}%`],
    );

  if (escaped) {
    query.where((builder) => {
      builder
        .where("boards.name", "ILIKE", `%${escaped}%`)
        .orWhere("boards.url", "ILIKE", `%${escaped}%`);
    });
  }

  try {
    const boards = await query;

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
