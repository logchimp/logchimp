import type { Request, Response } from "express";
import type { components, operations } from "@logchimp/api-ts-types";

import error from "../../../../errorResponse.json";

type ResponseBody =
  | components["schemas"]["GetRoadmapByUrlResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export function roadmapByUrl(
  req: Request<operations["getRoadmapByUrl"]["parameters"]["path"]>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const roadmap = req.roadmap as components["schemas"]["RoadmapPrivate"];

  // @ts-expect-error
  const permissions = (req?.user?.permissions || []) as Array<
    components["schemas"]["Permission"]
  >;
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
