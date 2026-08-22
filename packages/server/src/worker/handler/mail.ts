import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

class MailWorker {
  private workerInstance: Worker;

  private readonly workerName: string;

  constructor(name: string) {
    this.workerName = name;
  }

  async run(connection: ConnectionOptions) {
    if (!connection || this.workerInstance) return;

    this.workerInstance = new Worker(this.workerName, this.handler, {
      autorun: false,
      connection,
      removeOnComplete: {
        count: 0,
      },
      limiter: {
        max: 14,
        duration: 2000,
      },
    });

    this.workerInstance.run().catch((err) => {
      logger.error("Worker stopped unexpectedly:", err);
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Mail worker error:", err);
    });
  }

  handler(job: Job) {
    return null;
  }
}

export const mailWorker = new MailWorker("mail");
