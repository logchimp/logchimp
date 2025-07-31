import type { Request, Response } from "express";

export async function boardByUrl(req: Request, res: Response) {
  // @ts-ignore
  const board = req.board;

  res.status(200).send({ board });
}
