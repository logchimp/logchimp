import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IRoadmapPrivate,
  ISearchRoadmapRequestParam,
  ISearchRoadmapResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = ISearchRoadmapResponseBody | IApiErrorResponse;

export async function searchRoadmap(
  req: Request<ISearchRoadmapRequestParam>,
  res: Response<ResponseBody>,
) {
  const { name } = req.params;
  // @ts-ignore
  const permissions = req.user.permissions;

  const checkPermission = permissions.includes("roadmap:read");
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
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
