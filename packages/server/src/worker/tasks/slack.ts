import { type ConnectionOptions, Queue, type QueueOptions } from "bullmq";

import type { ConvertMessageJobData } from "../../services/slack/convert.service";

type BaseQueueOptions = Omit<QueueOptions, "connection">;

export const slackQueueName = "slack";
export class SlackQueue {
  protected queueInstance: Queue | null = null;

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

  /**
   * The job ID is derived from the Slack message, so double clicks on the
   * shortcut while a job is still queued don't create duplicates.
   * (BullMQ job IDs cannot contain ':')
   */
  convertMessageToPost(payload: ConvertMessageJobData) {
    return this.queueInstance.add("convertMessageToPost", payload, {
      jobId: `slack-${payload.teamId}-${payload.channelId}-${payload.messageTs}`,
    });
  }
}

export const slackQueue = new SlackQueue(slackQueueName, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    // failures are recorded in `slack_message_imports`; keeping the failed job
    // would block the user from trying the same message again
    removeOnFail: true,
  },
});
