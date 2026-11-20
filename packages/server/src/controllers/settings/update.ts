import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";
import * as v from "valibot";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { workspaceRepository } from "../../repository/workspace";
import {
  hasSiteNameOrLogo,
  settingsErrorMap,
  updateSiteSettingsRequestBodySchema,
} from "./schema";

const workspaceRepo = new workspaceRepository();

type ResponseBody =
  | components["schemas"]["UpdateSiteSettingsResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function update(
  req: Request<
    unknown,
    unknown,
    components["schemas"]["UpdateSiteSettingsRequestBody"]
  >,
  res: Response<ResponseBody>,
) {
  // @ts-expect-error
  const permissions = req.user.permissions as Array<
    components["schemas"]["Permission"]
  >;

  const checkPermission = permissions.find(
    (item) => item === "settings:update",
  );
  if (!checkPermission) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return;
  }

  const body = v.safeParse(updateSiteSettingsRequestBodySchema, req.body);
  if (!body.success) {
    res.status(400).send({
      message: "Invalid body parameters",
      code: "VALIDATION_ERROR",
      errors: body.issues.map((issue) => ({
        field: v.getDotPath(issue),
        message: settingsErrorMap[issue.message]
          ? settingsErrorMap[issue.message]
          : undefined,
        code: issue.message,
      })),
    });
    return;
  }

  const settingsUpdate = body.output;

  // Validate: at least one of site name or logo must remain after the update
  if (settingsUpdate.title !== undefined || settingsUpdate.logo !== undefined) {
    try {
      const currentSettings = await workspaceRepo.GetSettings();

      if (!hasSiteNameOrLogo(settingsUpdate, currentSettings)) {
        res.status(400).send({
          message: settingsErrorMap.SITE_NAME_OR_LOGO_REQUIRED,
          code: "SITE_NAME_OR_LOGO_REQUIRED",
        });
        return;
      }
    } catch (err) {
      logger.log({ level: "error", message: err });
      res.status(500).send({
        message: error.general.serverError,
        code: "SERVER_ERROR",
      });
      return;
    }
  }

  try {
    const settings = await workspaceRepo.UpdateSettings(settingsUpdate);

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
