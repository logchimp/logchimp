import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  IRoadmapPrivate,
  IUpdateRoadmapRequestBody,
  TPermission,
  TUpdateRoadmapResponseBody,
} from "@logchimp/types";
import * as v from "valibot";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | TUpdateRoadmapResponseBody
  | IApiValidationErrorResponse
  | IApiErrorResponse;

const bodySchema = v.object({
  name: v.message(
    v.pipe(v.optional(v.string(), ""), v.trim(), v.nonEmpty()),
    "ROADMAP_NAME_MISSING",
  ),
  url: v.message(
    v.pipe(
      v.optional(v.string(), ""),
      v.trim(),
      v.toLowerCase(),
      v.transform((url) => url.replace(/\W+/gi, "-")),
      v.nonEmpty(),
    ),
    "ROADMAP_URL_MISSING",
  ),
  color: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.length(6, "ROADMAP_COLOR_HEX_LENGTH"),
      v.hexadecimal("ROADMAP_COLOR_HEX_CHAR"),
    ),
  ),
  display: v.optional(v.boolean("BOOLEAN_EXPECTED")),
});

const schemaBodyErrorMap = {
  ROADMAP_NAME_MISSING: error.api.roadmaps.nameMissing,
  ROADMAP_URL_MISSING: error.api.roadmaps.urlMissing,
  ROADMAP_COLOR_HEX_LENGTH: error.general.colorCodeLength,
  ROADMAP_COLOR_HEX_CHAR: error.general.colorCodeInvalid,
  BOOLEAN_EXPECTED: error.general.booleanValue,
};

export async function updateRoadmap(
  req: Request<unknown, unknown, IUpdateRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const body = v.safeParse(bodySchema, req.body);
  if (!body.success) {
    return res.status(400).json({
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
  }

  // @ts-expect-error
  const id = (req.roadmap as IRoadmapPrivate).id;
  const { name, url, color, display } = body.output;

  try {
    const roadmaps = await database
      .update({
        name,
        url,
        color,
        display,
        updated_at: new Date().toJSON(),
      })
      .from("roadmaps")
      .where({
        id,
      })
      .returning<IRoadmapPrivate[]>([
        "id",
        "name",
        "url",
        "color",
        "index",
        "display",
        "created_at",
      ]);

    const roadmap = roadmaps[0];

    res.status(200).send({ roadmap });
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
