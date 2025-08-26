import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  IUpdateSiteSettingsRequestBody,
  TPermission,
  TUpdateSiteSettingsResponseBody,
} from "@logchimp/types";
import database from "../../database";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";

type ResponseBody = TUpdateSiteSettingsResponseBody | IApiErrorResponse;

export async function update(
  req: Request<unknown, unknown, IUpdateSiteSettingsRequestBody>,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions;

  const checkPermission = permissions.find(
    (item: TPermission) => item === "settings:update",
  );
  if (!checkPermission) {
    return res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
  }

  const {
    title,
    description,
    allowSignup,
    accentColor,
    googleAnalyticsId,
    developer_mode,
  } = req.body;

  try {
    const updateSettings = await database
      .update({
        title,
        description,
        allowSignup,
        accentColor,
        googleAnalyticsId,
        developer_mode,
      })
      .from("settings")
      .returning(["*", database.raw("labs::json as labs")]);

    const settings = updateSettings[0];

    res.status(200).send({
      settings,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: err,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
