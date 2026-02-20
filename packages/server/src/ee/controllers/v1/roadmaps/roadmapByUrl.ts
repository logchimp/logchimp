import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IGetRoadmapByUrlRequestParam,
  IGetRoadmapByUrlResponseBody,
  TPermission,
} from "@logchimp/types";

import error from "../../../../errorResponse.json";

type ResponseBody = IGetRoadmapByUrlResponseBody | IApiErrorResponse;

export function roadmapByUrl(
  req: Request<IGetRoadmapByUrlRequestParam>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const roadmap = req.roadmap;

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as TPermission[];
  const hasPermission = permissions.includes("roadmap:read");

  if (!hasPermission && !roadmap.display) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  res.status(200).send({ roadmap });
}
