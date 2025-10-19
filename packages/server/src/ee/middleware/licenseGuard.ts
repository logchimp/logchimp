import type { Request, Response, NextFunction } from "express";
import type { IApiErrorResponse } from "@logchimp/types";

import error from "../../errorResponse.json";
import { checkLicense } from "../services/license/checkLicense";

export async function licenseGuard(
  _: Request,
  res: Response<IApiErrorResponse>,
  next: NextFunction,
) {
  const result = await checkLicense();
  console.log("license guard.");
  console.log("result:", result);

  if (!result) {
    return res.status(403).send({
      message: error.middleware.license.verification,
      code: "LICENSE_VALIDATION_FAILED",
    });
  }

  next();
}
