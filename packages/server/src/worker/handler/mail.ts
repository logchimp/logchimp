import { type ConnectionOptions, type Job, Worker } from "bullmq";

class MailWorker {
  private workerInstance: Worker;

  private readonly workerName: string;

  constructor(name: string) {
    this.workerName = name;
  }

  async run(connection: ConnectionOptions) {
    if (!connection) return;

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

    try {
      await this.workerInstance.run();
    } catch (error) {
      throw new Error(`failed to run mail worker with error: ${error}`);
    }
  }

  handler(job: Job) {
    return null;
  }
}

export const mailWorker = new MailWorker("mail");
