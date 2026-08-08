import { type ConnectionOptions, Queue, type QueueOptions } from "bullmq";

import type { ISendPostRoadmapChangeMailPayload } from "../../services/mail/types";

type BaseQueueOptions = Omit<QueueOptions, "connection">;

export const postsQueueName = "posts";
class PostsQueue {
  private queueInstance: Queue;

  private readonly queueName: string;
  private readonly queueOptions: BaseQueueOptions;

  constructor(queueName: string, options?: BaseQueueOptions) {
    this.queueName = queueName;
    this.queueOptions = options;
  }

  public init(connection: ConnectionOptions) {
    if (this.queueInstance || !connection) {
      return;
    }

    this.queueInstance = new Queue(this.queueName, {
      ...this.queueOptions,
      connection: connection as ConnectionOptions,
    });
  }
}

export const postsQueue = new PostsQueue(postsQueueName, {
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
  },
});
