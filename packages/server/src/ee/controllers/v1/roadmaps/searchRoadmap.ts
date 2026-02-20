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
  const { name } = req.params;
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

  try {
    const roadmaps = await database<IRoadmapPrivate>("roadmaps")
      .select()
      .where("name", "ILIKE", `${name}%`);

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
