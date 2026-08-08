import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

import { mailQueueName } from "../tasks/mail";
import * as mailWorkerService from "../../services/mail/worker.service";

type MailJobHandler = (data: unknown) => Promise<unknown>;

export class MailWorker {
  private workerInstance: Worker;

  private readonly workerName: string;
  private eeServices: any;
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
      this.getEEService();
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Mail worker error:", err);
    });

    this.workerInstance.on("closed", () => {
      this.isRunning = false;
    });
  }

  private async getEEService() {
    try {
      this.eeServices = (
        await (await import("../../ee/worker/handler/mail")).getMailWorker()
      ).mail;
    } catch (_e) {}
  }

  private getHandlers(): Record<string, MailJobHandler> {
    return Object.assign(
      Object.create(null),
      mailWorkerService,
      this.eeServices,
    );
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
