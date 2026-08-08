import { type ConnectionOptions, type Job, Worker } from "bullmq";
import logger from "../../utils/logger";

import { postsQueueName } from "../tasks/posts";
import * as postsWorkerService from "../../services/posts/worker.service";

class PostsWorker {
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
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Posts worker error:", err);
    });

    this.workerInstance.on("closed", () => {
      this.isRunning = false;
    });
  }

  private async handler(job: Job) {
    const name = job.name;
    const data = job.data;

    if (name in postsWorkerService) {
      await postsWorkerService[name](data);
    } else {
      await job.moveToFailed(Error(`job name '${name}' not found`), job.token);
    }

    return null;
  }
}

export const postsWorker = new PostsWorker(postsQueueName);
