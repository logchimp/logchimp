import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

import { mailQueueName } from "../tasks/mail";
import * as mailWorkerService from "../../services/mail/worker.service";

type MailJobHandler = (data: unknown) => Promise<unknown>;

export class MailWorker {
  private workerInstance: Worker;

  private readonly workerName: string;
  private eeServices: Record<string, any> = {};
  private eeLoaded = false;
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
    if (this.eeLoaded) return;
    try {
      const eeServicesImport = await import("../../ee/worker/handler/mail");
      const eeMailServices = await eeServicesImport.getMailWorker();
      this.eeServices = eeMailServices.mail ?? {};
    } catch (_) {
      this.eeServices = {};
    } finally {
      this.eeLoaded = true;
    }
  }

  private getHandlers(): Record<string, MailJobHandler> {
    return Object.assign(
      Object.create(null),
      mailWorkerService,
      this.eeServices,
    );
  }

  private handler = async (job: Job) => {
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
