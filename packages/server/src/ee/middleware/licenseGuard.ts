import type { Request, Response, NextFunction } from "express";
import type { IApiErrorResponse } from "@logchimp/types";

import error from "../../errorResponse.json";
import { checkLicense } from "../services/license/checkLicense";
import logger from "../../utils/logger";

export async function licenseGuard(
  _: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  try {
    const result = await checkLicense();

    if ("code" in result || result.status !== "active") {
      return res.status(403).send({
        message: error.middleware.license.verification,
        code: "LICENSE_VALIDATION_FAILED",
      });
    }

    next();
  } catch (e) {
    logger.error({
      message: e,
    });

    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
  }
}
