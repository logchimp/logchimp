import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";
import * as v from "valibot";

// utils
import logger from "../../utils/logger";
import error from "../../errorResponse.json";
import { workspaceRepository } from "../../repository/workspace";
import {
  settingsErrorMap,
  updateSiteSettingsRequestBodySchema,
} from "./schema";
import { SiteNameOrLogoRequiredError } from "../../services/workspace/error";

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

  try {
    const settings = await workspaceRepo.UpdateSettings(body.output);

    res.status(200).send({
      settings,
    });
  } catch (err) {
    if (err instanceof SiteNameOrLogoRequiredError) {
      res.status(400).send({
        message: settingsErrorMap.SITE_NAME_OR_LOGO_REQUIRED,
        code: "SITE_NAME_OR_LOGO_REQUIRED",
      });
      return;
    }

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
