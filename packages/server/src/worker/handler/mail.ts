import { type Job, Worker, type ConnectionOptions } from "bullmq";

class MailWorker {
  constructor(name: string, connection: ConnectionOptions) {
    new Worker(name, this.handler, {
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
  }

  handler(job: Job) {
    return null;
  }
}

export const mailWorker = (connection: ConnectionOptions) =>
  new MailWorker("mail", connection);
