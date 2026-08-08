import * as mailWorkerService from "../tasks/mail";

import { checkLicense as checkLicenseService } from "../../do-not-remove/services/checkLicense";

export async function getMailWorker() {
  const result = await checkLicenseService();

  if ("code" in result || result.status !== "active") {
    return {
      mail: mailWorkerService,
    };
  }

  return {
    mail: {},
  };
}
