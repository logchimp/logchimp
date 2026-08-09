import { mailQueue } from "./mail";
import { postsQueue } from "./posts";

async function loadQueues() {
  try {
    const { getEEQueues } = await import("../../ee/worker/tasks");
    return await getEEQueues();
  } catch (_) {
    return [mailQueue, postsQueue];
  }
}

export default loadQueues();
