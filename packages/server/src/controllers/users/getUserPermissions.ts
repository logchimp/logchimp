import type { Request, Response } from "express";

export function getUserPermissions(req: Request, res: Response) {
  // @ts-ignore
  const user = req.user;

  res.status(200).send({
    permissions: user.permissions,
  });
}
