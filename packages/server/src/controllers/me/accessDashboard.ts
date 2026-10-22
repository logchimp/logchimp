import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

// utils
import error from "../../errorResponse.json";

type ResponseBody =
  | components["schemas"]["CheckUserDashboardAccessResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export function accessDashboard(req: Request, res: Response<ResponseBody>) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;
  const checkPermission = permissions.includes("dashboard:read");

  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  res.status(200).send({
    access: true,
  });
}
