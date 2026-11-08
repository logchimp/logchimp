import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody =
  | components["schemas"]["SearchRoadmapResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function searchRoadmap(
  req: Request<operations["searchRoadmaps"]["parameters"]["path"]>,
  res: Response<ResponseBody>,
) {
  const name = (req.params?.name || "").trim();
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

  const checkPermission = permissions.includes("roadmap:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const escaped = name.replace(/[\\%_]/g, "\\$&");

  const query = database<components["schemas"]["RoadmapPrivate"]>("roadmaps")
    .select()
    .orderByRaw(
      `CASE
        WHEN lower(name) = lower(?)
          OR lower(url) = lower(?) THEN 0
        WHEN name ILIKE ?
          OR url ILIKE ? THEN 1
        ELSE 2
      END`,
      [name, name, `${escaped}%`, `${escaped}%`],
    );

  if (escaped) {
    query.where((builder) => {
      builder
        .where("name", "ILIKE", `%${escaped}%`)
        .orWhere("url", "ILIKE", `%${escaped}%`);
    });
  }

  try {
    const roadmaps = await query;

    res.status(200).send({
      roadmaps,
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
