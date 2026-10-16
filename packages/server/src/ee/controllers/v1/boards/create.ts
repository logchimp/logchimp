import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  TBoardCreateRequestBody,
  TBoardCreateResponseBody,
  TPermission,
} from "@logchimp/types";

// database
import database from "../../../../database";

// utils
import {
  generateHexColor,
  generateNanoID as nanoid,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { BOARD_NAME_MAX_LENGTH } from "../../../../constants";

type ResponseBody =
  | TBoardCreateResponseBody
  | IApiErrorResponse
  | IApiValidationErrorResponse;

export async function create(
  req: Request<unknown, unknown, TBoardCreateRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
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

  // count code points, the same way Postgres counts varchar length
  if (typeof name === "string" && [...name].length > BOARD_NAME_MAX_LENGTH) {
    res.status(400).send({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: [
        {
          message: error.api.boards.nameTooLong,
          code: "BOARD_NAME_TOO_LONG",
        },
      ],
    });
    return;
  }

  try {
    const createBoard = await database
      .insert({
        boardId: uuidv4(),
        name,
        url: `new-board-${nanoid(10)}`,
        color: generateHexColor(),
        display,
      })
      .into("boards")
      .returning("*");

    const board = createBoard[0];

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
