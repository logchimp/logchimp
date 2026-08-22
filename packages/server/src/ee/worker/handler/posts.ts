import * as postsWorkerService from "../../services/posts/worker.service";

import { checkLicense as checkLicenseService } from "../../do-not-remove/services/checkLicense";

export async function getPostsWorker() {
  const result = await checkLicenseService();

  if ("code" in result || result.status !== "active") {
    return {
      posts: {},
    };
  }

  return {
    posts: postsWorkerService,
  };
}
