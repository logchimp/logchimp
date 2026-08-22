import type { QueueOptions } from "bullmq";

import type { IPostRoadmapChangeEvent } from "../../services/posts/types";
import { PostsQueue, postsQueueName } from "../../../worker/tasks/posts";

type BaseQueueOptions = Omit<QueueOptions, "connection">;

class PostsEEQueue extends PostsQueue {
  constructor(options?: BaseQueueOptions) {
    super(postsQueueName, options);
  }

  postRoadmapChangeEvent(payload: IPostRoadmapChangeEvent) {
    return this.queueInstance.add("postRoadmapChangeEvent", payload);
  }
}

export const postsQueue = new PostsEEQueue({
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
  },
});
