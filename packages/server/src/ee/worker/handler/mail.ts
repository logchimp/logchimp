import * as mailWorkerService from "../../services/mail/worker.service";

import { licenseService } from "../../do-not-remove/services/LicenseService";

export async function getMailWorker() {
  const result = await licenseService.checkLicense();

  if ("code" in result || result.status !== "active") {
    return {
      mail: {},
    };
  }

  return {
    mail: mailWorkerService,
  };
}
