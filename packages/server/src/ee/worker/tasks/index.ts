import { checkLicense as checkLicenseService } from "../../do-not-remove/services/checkLicense";
import { mailQueue } from "./mail";
import { postsQueue } from "./posts";

export async function getEEQueues() {
  const result = await checkLicenseService();
  if ("code" in result || result.status !== "active") {
    return [];
  }

  return [mailQueue, postsQueue];
}
