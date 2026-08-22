import { type ConnectionOptions, Queue, type QueueOptions } from "bullmq";

import type { IPasswordResetJwtPayload } from "../../types";

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
}

export const mailQueue = new MailQueue(mailQueueName, {
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
  },
});
