import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRoadmapPrivate,
  ISearchRoadmapRequestParam,
  ISearchRoadmapResponseBody,
  TPermission,
} from "@logchimp/types";
import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = ISearchRoadmapResponseBody | IApiErrorResponse;

export async function searchRoadmap(
  req: Request<ISearchRoadmapRequestParam>,
  res: Response<ResponseBody>,
) {
  const name = (req.params?.name || "").trim();
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:read");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const escaped = name.replace(/[\\%_]/g, "\\$&");

  const query = database<IRoadmapPrivate>("roadmaps")
    .select()
    .orderByRaw(
      `CASE
        WHEN lower(name) = lower(?) THEN 0
        WHEN name ILIKE ? THEN 1
        ELSE 2
      END
    `,
      [escaped, `${escaped}%`],
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
