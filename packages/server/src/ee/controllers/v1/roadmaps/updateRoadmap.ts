import type { Response } from "express";
import type {
  IApiErrorResponse,
  IApiValidationErrorResponse,
  IRoadmapPrivate,
  IUpdateRoadmapRequestBody,
  TPermission,
  TUpdateRoadmapResponseBody,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../../../../express";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | TUpdateRoadmapResponseBody
  | IApiValidationErrorResponse
  | IApiErrorResponse;

export async function updateRoadmap(
  req: ExpressRequestContext<unknown, unknown, IUpdateRoadmapRequestBody>,
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

  const id = req.ctx.roadmap.id;
  const { name, url, color, display } = req.body;
  const trimmedName = name.trim();

  if (!trimmedName) {
    return res.status(400).send({
      message: error.api.roadmaps.nameMissing,
      code: "ROADMAP_NAME_MISSING",
    });
  }

  if (!url) {
    return res.status(400).send({
      errors: [
        url
          ? undefined
          : {
              message: error.api.roadmaps.urlMissing,
              code: "ROADMAP_URL_MISSING",
            },
      ],
    });
  }

  const slimUrl = url.replace(/\W+/gi, "-").trim().toLowerCase();

  try {
    const roadmaps = await database
      .update({
        name: trimmedName,
        url: slimUrl,
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
