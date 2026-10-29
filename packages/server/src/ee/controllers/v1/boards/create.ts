import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type { components } from "@logchimp/api-ts-types";
import * as v from "valibot";

// database
import database from "../../../../database";

// utils
import {
  dateToISOString,
  generateHexColor,
  generateNanoID as nanoid,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { BoardRepository } from "../../../repository/board";
import valkey from "../../../../cache";
import { createBoardEERequestBodySchema } from "./schema";

type ResponseBody =
  | components["schemas"]["CreateBoardResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

const boardRepository = new BoardRepository(database, valkey);

const createBoardSchemaBodyErrorMap = {
  NAME_MIN_LENGTH: "Board name cannot be empty.",
  NAME_MAX_LENGTH: "Board name cannot exceed 50 characters.",
};

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

  const body = v.safeParse(createBoardEERequestBodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: createBoardSchemaBodyErrorMap[issue.message]
          ? createBoardSchemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
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

    res.status(201).send({
      board: {
        ...board,
        createdAt: dateToISOString(board.createdAt),
      },
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
