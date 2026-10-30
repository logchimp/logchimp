import type { Request, Response } from "express";

export function getUserPermissions(req: Request, res: Response) {
  // @ts-expect-error
  const user = req.user;

  res.status(200).send({
    permissions: user.permissions,
  });
}
