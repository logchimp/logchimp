import { type ConnectionOptions, Queue, type QueueOptions } from "bullmq";

import type { IPasswordResetJwtPayload } from "../../types";
import type { ISendPostRoadmapChangeMailPayload } from "../../services/mail/types";

type BaseQueueOptions = Omit<QueueOptions, "connection">;

export const mailQueueName = "trx-mails";
class MailQueue {
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

  sendPasswordResetTokenMail(payload: IPasswordResetJwtPayload) {
    return this.queueInstance.add("sendPasswordResetTokenMail", payload);
  }

  /**
   * Send post roadmap change mail accepts an array of ISendPostRoadmapChangeMailPayload.
   * Since there can be more 10/10K/1M voters on a post.
   * @param payloads
   */
  sendPostRoadmapChangeMail(
    payloads: Array<ISendPostRoadmapChangeMailPayload>,
  ) {
    const jobs = payloads.map((payload) => ({
      name: "sendPostRoadmapChangeMail",
      data: payload,
    }));
    return this.queueInstance.addBulk(jobs);
  }
}

export const mailQueue = new MailQueue(mailQueueName, {
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
  },
});
