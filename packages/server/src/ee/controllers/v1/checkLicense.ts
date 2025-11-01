import error from "../../../errorResponse.json";
import logger from "../../../utils/logger";
import { checkLicense as checkLicenseService } from "../../services/license/checkLicense";

export async function checkLicenseController(req, res, next) {
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
