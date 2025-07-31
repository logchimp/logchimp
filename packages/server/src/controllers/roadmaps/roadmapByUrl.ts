import type { Request, Response } from "express";

export async function roadmapByUrl(req: Request, res: Response) {
  // @ts-ignore
  const roadmap = req.roadmap;

  res.status(200).send({ roadmap });
}
