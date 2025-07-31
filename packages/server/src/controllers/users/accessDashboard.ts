import type { Request, Response } from "express";

// utils
import error from "../../errorResponse.json";

export function accessDashboard(req: Request, res: Response) {
  // @ts-ignore
  const permissions = req.user.permissions;
  const checkPermission = permissions.includes("dashboard:read");

  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  res.status(200).send({
    access: true,
  });
}
