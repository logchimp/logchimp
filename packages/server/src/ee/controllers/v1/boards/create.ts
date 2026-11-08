import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type { components } from "@logchimp/api-ts-types";

// database
import database from "../../../../database";

// utils
import {
  generateHexColor,
  generateNanoID as nanoid,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { BoardRepository } from "../../../repository/board";
import valkey from "../../../../cache";

type ResponseBody =
  | components["schemas"]["CreateBoardResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

const boardRepository = new BoardRepository(database, valkey);

export async function create(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["CreateBoardRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  const name = req.body.name || "new board";
  const display = req.body.display;

  const checkPermission = permissions.includes("board:create");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const boardId = uuidv4();

  try {
    await database
      .insert({
        boardId,
        name,
        url: `new-board-${nanoid(10)}`,
        color: generateHexColor(),
        display,
      })
      .into("boards");

    const boards = await boardRepository.GetPrivateBoardByIDs([boardId]);
    const board = boards[0];

    res.status(201).send({ board });
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
