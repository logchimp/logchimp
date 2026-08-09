import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

import { postsQueueName } from "../tasks/posts";
import * as postsWorkerService from "../../services/posts/worker.service";

type MailJobHandler = (data: unknown) => Promise<unknown>;

export class PostsWorker {
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
        max: 3,
        duration: 1000,
      },
    });

    this.workerInstance.run().catch((err) => {
      logger.error("Worker stopped unexpectedly:", err);
      this.isRunning = true;
    });

    this.workerInstance.on("ready", () => {
      this.isRunning = true;
      this.getEEService();
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Posts worker error:", err);
    });

    this.workerInstance.on("closed", () => {
      this.isRunning = false;
    });
  }

  private async getEEService() {
    if (this.eeLoaded) return;
    try {
      const eeServiceImport = await import("../../ee/worker/handler/posts");
      const eePostsService = await eeServiceImport.getPostsWorker();
      this.eeServices = eePostsService.posts ?? {};
    } catch (_) {
      this.eeServices = {};
    } finally {
      this.eeLoaded = true;
    }
  }

  private getHandlers(): Record<string, MailJobHandler> {
    return Object.assign(
      Object.create(null),
      postsWorkerService,
      this.eeServices,
    );
  }

  private handler = async (job: Job) => {
    const name = job.name;
    const data = job.data;

    const handlers = this.getHandlers();
    const handler = handlers[name];

    if (!handler) {
      throw new Error(`Unsupported posts job name: '${job.name}'`);
    }

    await handler(data);
  }
}

export const postsWorker = new PostsWorker(postsQueueName);
