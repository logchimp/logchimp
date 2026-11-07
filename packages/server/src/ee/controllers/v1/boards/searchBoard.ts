import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { dateToISOString } from "../../../../helpers";

type ResponseBody =
  | components["schemas"]["SearchBoardResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function searchBoard(
  req: Request<operations["searchBoardByName"]["parameters"]["path"]>,
  res: Response<ResponseBody>,
) {
  const name = (req.params?.name || "").trim();
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

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
        WHEN lower(boards.name) = lower(?)
          OR lower(boards.url) = lower(?) THEN 0
        WHEN boards.name ILIKE ?
          OR boards.url ILIKE ? THEN 1
        ELSE 2
      END`,
      [name, name, `${escaped}%`, `${escaped}%`],
    );

  if (escaped) {
    query.where((builder) => {
      builder
        .where("boards.name", "ILIKE", `%${escaped}%`)
        .orWhere("boards.url", "ILIKE", `%${escaped}%`);
    });
  }

  try {
    const boards = (await query).map((board) => ({
      ...board,
      post_count: Number.parseInt(board.post_count, 10),
    }));

    const typedDbResults = boards.map((board) => ({
      ...board,
      createdAt: dateToISOString(board.createdAt),
    })) as Array<components["schemas"]["BoardPrivate"]>;

    res.status(200).send({
      boards: typedDbResults,
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
