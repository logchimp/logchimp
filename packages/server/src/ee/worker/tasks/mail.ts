import type { QueueOptions } from "bullmq";

import type { ISendPostRoadmapChangeMailPayload } from "../../services/mail/types";
import { MailQueue, mailQueueName } from "../../../worker/tasks/mail";

type BaseQueueOptions = Omit<QueueOptions, "connection">;

class MailEEQueue extends MailQueue {
  constructor(options?: BaseQueueOptions) {
    super(mailQueueName, options);
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

export const mailQueue = new MailEEQueue({
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
  },
});
