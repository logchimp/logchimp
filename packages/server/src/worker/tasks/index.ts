import { mailQueue } from "./mail";
import { postsQueue } from "./posts";

async function loadQueues() {
  const ceQueues = [mailQueue, postsQueue];

  try {
    const { getEEQueues } = await import("../../ee/worker/tasks");
    const eeQueues = await getEEQueues();
    return [...eeQueues, ...ceQueues];
  } catch (_) {
    return ceQueues;
  }
}

export default loadQueues();
