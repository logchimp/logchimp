import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type {
  IApiErrorResponse,
  TBoardCreateRequestBody,
  TBoardCreateResponseBody,
  TPermission,
} from "@logchimp/types";
import * as v from "valibot";

// database
import database from "../../../../database";

// utils
import {
  generateHexColor,
  generateNanoID as nanoid,
} from "../../../../helpers";
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";
import { createBoardEERequestBodySchema } from "./schema";

type ResponseBody = TBoardCreateResponseBody | IApiErrorResponse;

const createBoardSchemaBodyErrorMap = {
  NAME_MIN_LENGTH: "Board name cannot be empty.",
  NAME_MAX_LENGTH: "Board name cannot exceed 50 characters.",
};

export async function create(
  req: Request<unknown, unknown, TBoardCreateRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

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

  try {
    const createBoard = await database
      .insert({
        boardId: uuidv4(),
        name: body.output.name ?? "new board",
        url: `new-board-${nanoid(10)}`,
        color: generateHexColor(),
        display: body.output.display,
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
