import { licenseService } from "../../do-not-remove/services/LicenseService";
import { mailQueue } from "./mail";
import { postsQueue } from "./posts";

export async function getEEQueues() {
  const result = await licenseService.checkLicense();
  if ("code" in result || result.status !== "active") {
    return [];
  }

  return [mailQueue, postsQueue];
}
