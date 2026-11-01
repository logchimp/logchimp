import { mailQueue } from "./mail";
import { postsQueue } from "./posts";
import { slackQueue } from "./slack";

async function loadQueues() {
  const ceQueues = [mailQueue, postsQueue, slackQueue];

  try {
    const { getEEQueues } = await import("../../ee/worker/tasks");
    const eeQueues = await getEEQueues();
    return [...eeQueues, ...ceQueues];
  } catch (_) {
    return ceQueues;
  }
}

export default loadQueues();
