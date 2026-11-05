import * as postsWorkerService from "../../services/posts/worker.service";

import { licenseService } from "../../do-not-remove/services/LicenseService";

export async function getPostsWorker() {
  const result = await licenseService.checkLicense();

  if ("code" in result || result.status !== "active") {
    return {
      posts: {},
    };
  }

  return {
    posts: postsWorkerService,
  };
}
