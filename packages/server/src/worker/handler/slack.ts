import {
  type ConnectionOptions,
  type Job,
  UnrecoverableError,
  Worker,
} from "bullmq";
import logger from "../../utils/logger";

import { slackQueueName } from "../tasks/slack";
import {
  type ConvertMessageJobData,
  convertMessageToPost,
  reportConversionFailure,
} from "../../services/slack/convert.service";

class SlackWorker {
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
      concurrency: 2,
    });

    this.workerInstance.run().catch((err) => {
      logger.error("Worker stopped unexpectedly:", err);
      this.isRunning = false;
    });

    this.workerInstance.on("ready", () => {
      this.isRunning = true;
    });

    this.workerInstance.on("error", (err) => {
      logger.error("Slack worker error:", err);
    });

    this.workerInstance.on("failed", async (job, err) => {
      if (!job) return;

      // only report once the job won't be retried anymore
      const maxAttempts = job.opts.attempts ?? 1;
      const isFinal =
        err instanceof UnrecoverableError || job.attemptsMade >= maxAttempts;
      if (!isFinal) return;

      await reportConversionFailure(job.data as ConvertMessageJobData, err);
    });

    this.workerInstance.on("closed", () => {
      this.isRunning = false;
    });
  }

  private handler = async (job: Job) => {
    switch (job.name) {
      case "convertMessageToPost":
        await convertMessageToPost(job.data as ConvertMessageJobData, {
          attempt: job.attemptsMade,
        });
        return;
      default:
        throw new UnrecoverableError(
          `Unsupported Slack job name: '${job.name}'`,
        );
    }
  };
}

export const slackWorker = new SlackWorker(slackQueueName);
