import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

import { mailQueueName } from "../tasks/mail";
import * as mailService from "../../services/mail/mail.service";

type MailJobHandler = (data: unknown) => Promise<unknown>;

class MailWorker {
  private workerInstance: Worker;

  private readonly workerName: string;
  isRunning: boolean = false;

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
      this.isRunning = false;
    });

    this.workerInstance.on("ready", () => {
      this.isRunning = true;
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Mail worker error:", err);
    });

    this.workerInstance.on("closed", () => {
      this.isRunning = false;
    });
  }

  private getHandlers(): Record<string, MailJobHandler> {
    return Object.assign(Object.create(null), mailService);
  }

  private async handler(job: Job) {
    const name = job.name;
    const data = job.data;

    const handlers = this.getHandlers();
    const handler = handlers[name];

    if (!handler) {
      throw new Error(`Unsupported mail job name: '${job.name}'`);
    }

    await handler(data);
  }

  private sendMail() {}
}

export const mailWorker = new MailWorker(mailQueueName);
