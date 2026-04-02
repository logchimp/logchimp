import type { Request, Response } from "express";
import type {
  IApiErrorResponse,
  ICheckLicenseControllerResponseBody,
} from "@logchimp/types";

import error from "../../../errorResponse.json";
import logger from "../../../utils/logger";
import { checkLicense as checkLicenseService } from "../../do-not-remove/services/checkLicense";

type ResponseType = IApiErrorResponse | ICheckLicenseControllerResponseBody;

export async function checkLicenseController(
  _: Request,
  res: Response<ResponseType>,
) {
  try {
    const result = await checkLicenseService();

    if ("code" in result || result.status !== "active") {
      return res.status(403).send({
        message: error.middleware.license.verification,
        code: "LICENSE_VALIDATION_FAILED",
      });
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
