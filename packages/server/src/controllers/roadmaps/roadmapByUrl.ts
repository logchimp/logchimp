import type { Request, Response } from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  IGetRoadmapByUrlResponseBody,
} from "@logchimp/types";

export async function roadmapByUrl(
  req: Request<IGetRoadmapByUrlRequestParam>,
  res: Response<IGetRoadmapByUrlResponseBody>,
) {
  // @ts-expect-error
  const roadmap = req.roadmap;

  res.status(200).send({ roadmap });
}
