import type { Response } from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  IGetRoadmapByUrlResponseBody,
} from "@logchimp/types";
import type { ExpressRequestContext } from "../../express";

export async function roadmapByUrl(
  req: ExpressRequestContext<IGetRoadmapByUrlRequestParam>,
  res: Response<IGetRoadmapByUrlResponseBody>,
) {
  const roadmap = req.ctx.roadmap;

  res.status(200).send({ roadmap });
}
