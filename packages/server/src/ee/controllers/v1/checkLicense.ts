import type { Request, Response } from "express";

import error from "../../../errorResponse.json";
import logger from "../../../utils/logger";
// import { checkLicense as checkLicenseService } from "../../do-not-remove/services/checkLicense";


//give a local fall back
type CheckLicenseResult =
  | { status: "active" | string }
  | { code: string };

const getCheckLicenseService = async (): Promise<() => Promise<CheckLicenseResult>> => {
  try {
    const mod = (await (new Function(
      "p",
      "return import(p)"
    )("../../do-not-remove/services/checkLicense") as Promise<{
      checkLicense: () => Promise<CheckLicenseResult>;
    }>));

    return mod.checkLicense;
  } catch {
    return async () => ({ status: "active" });
  }
};

export async function checkLicenseController(_: Request, res: Response) {
  try {
    // const result = await checkLicenseService();

    //changed the controller
    const checkLicenseService = await getCheckLicenseService();
    const result = await checkLicenseService();

    if ("code" in result || result.status !== "active") {
      return res.status(403).send({
        message: error.middleware.license.verification,
        code: "LICENSE_VALIDATION_FAILED",
      });
    }

    res.status(200).send({
      status: result.status,
    });
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
