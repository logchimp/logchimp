import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  IBoardUpdateRequestBody,
  TBoardUpdateResponseBody,
  TPermission,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../../../database";
import { invalidateBoardCache } from "../../../services/boards/invalidateCache";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | TBoardUpdateResponseBody
  | IApiErrorResponse
  | IApiValidationErrorResponse;

const bodySchema = v.object({
  name: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "BOARD_NAME_MISSING",
  ),
  url: v.message(
    v.pipe(
      v.optional(v.string(), ""),
      v.trim(),
      v.toLowerCase(),
      v.transform((url) => url.replace(/\W+/gi, "-")),
      v.nonEmpty(),
    ),
    "BOARD_URL_MISSING",
  ),
  color: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.length(6, "BOARD_COLOR_HEX_LENGTH"),
      v.hexadecimal("BOARD_COLOR_HEX_CHAR"),
    ),
  ),
  view_voters: v.optional(v.boolean("BOOLEAN_EXPECTED")),
  display: v.optional(v.boolean("BOOLEAN_EXPECTED")),
});

const schemaBodyErrorMap = {
  BOARD_NAME_MISSING: error.api.boards.nameMissing,
  BOARD_URL_MISSING: error.api.boards.urlMissing,
  BOARD_COLOR_HEX_LENGTH: error.general.colorCodeLength,
  BOARD_COLOR_HEX_CHAR: error.general.colorCodeInvalid,
  BOOLEAN_EXPECTED: error.general.booleanValue,
};

export async function updateBoard(
  req: Request<unknown, unknown, IBoardUpdateRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("board:update");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const body = v.safeParse(bodySchema, req.body);
  if (!body.success) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid body parameters",
      errors: body.issues.map((issue) => ({
        ...issue,
        message: schemaBodyErrorMap[issue.message]
          ? schemaBodyErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  // @ts-expect-error
  const boardId = req.board.boardId;
  // @ts-expect-error
  const boardUrl = req.board.url;

  const { name, url, color, view_voters, display } = body.output;

  if (boardUrl !== url) {
    const urlExists = await database
      .select()
      .from("boards")
      .where({
        url,
      })
      .first();
    if (urlExists) {
      res.status(409).send({
        message: error.api.boards.urlExists,
        code: "BOARD_URL_EXISTS",
      });
      return;
    }
  }

  try {
    const boards = await database
      .update({
        name,
        url,
        color,
        view_voters,
        display,
        updatedAt: new Date().toJSON(),
      })
      .from("boards")
      .where({
        boardId,
      })
      .returning("*");

    const board = boards[0];

    await invalidateBoardCache(boardId);

    res.status(200).send({ board });
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
