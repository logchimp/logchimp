import type { Request, Response } from "express";
import type { components } from "@logchimp/api-ts-types";

import error from "../../../errorResponse.json";
import logger from "../../../utils/logger";
import { licenseService } from "../../do-not-remove/services/LicenseService";

type ResponseType =
  | components["schemas"]["CheckLicenseControllerResponseBody"]
  | components["schemas"]["GenericAPIErrorResponseBody"];

export async function checkLicenseController(
  _: Request,
  res: Response<ResponseType>,
) {
  try {
    const result = await licenseService.checkLicense();

    if ("code" in result || result.status !== "active") {
      res.status(403).send({
        message: error.middleware.license.verification,
        code: "LICENSE_VALIDATION_FAILED",
      });
      return;
    }

    res.status(200).send({
      status: result.status,
      hierarchy: result.hierarchy,
    });
  } catch (e) {
    logger.error({
      message: "License check failed",
      err: e,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
