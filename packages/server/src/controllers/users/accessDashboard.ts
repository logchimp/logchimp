import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ICheckUserDashboardAccess,
  TPermission,
} from "@logchimp/types";

// utils
import error from "../../errorResponse.json";

type ResponseBody = ICheckUserDashboardAccess | IApiErrorResponse;

export function accessDashboard(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const permissions = req.user.permissions as TPermission[];
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
