import { parseURL } from "iovalkey/built/utils";
import { GlideClient } from "@valkey/valkey-glide";
import { createValkeyGlideClient } from "bullmq";

import { configManager } from "../utils/logchimpConfig";

export async function createWorkerClient() {
  const config = configManager.getConfig();

  const url = parseURL(config.cacheUrl);
  const addresses = [
    {
      host: url.host as string,
      port: url.port
        ? Number.parseInt(
            // @ts-expect-error
            url.port,
            10,
          )
        : 6379,
    },
  ];

  const clientOptions = {
    addresses,
    ...(url.password && {
      credentials: {
        ...(url.username && { username: url.username as string }),
        password: url.password as string,
      },
    }),
    // optional but recommended
    requestTimeout: 5000,
    clientName: "bullmq-worker",
  };

  const valkeyWorkerClient = await GlideClient.createClient(clientOptions);

  return createValkeyGlideClient(valkeyWorkerClient);
}
