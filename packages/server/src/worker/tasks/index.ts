import { mailQueue } from "./mail";
import { postsQueue } from "./posts";

let queues = [mailQueue, postsQueue];

(async () => {
  try {
    queues = await (await import("../../ee/worker/tasks")).getEEQueues();
  } catch (_) {}
})();

export default queues;
