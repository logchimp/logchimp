import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ISortRoadmapRequestBody,
  TPermission,
  TSortRoadmapResponseBody,
} from "@logchimp/types";

import database from "../../../../database";

// utils
import logger from "../../../../utils/logger";
import error from "../../../../errorResponse.json";

type ResponseBody = TSortRoadmapResponseBody | IApiErrorResponse;

export async function sort(
  req: Request<unknown, unknown, ISortRoadmapRequestBody>,
  res: Response<ResponseBody>,
) {
  const { from, to } = req.body;
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];

  const checkPermission = permissions.includes("roadmap:update");
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  if (from.id === to.id) {
    res.status(204).send();
    return;
  }

  if (from.id === to.id) {
    return res.status(204).send();
  }

  try {
    // to
    await database
      .update({
        index: to.index,
      })
      .from("roadmaps")
      .where({
        id: to.id,
      });

    // from
    await database
      .update({
        index: from.index,
      })
      .from("roadmaps")
      .where({
        id: from.id,
      });

    res.sendStatus(200);
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
