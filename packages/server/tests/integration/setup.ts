import { beforeAll } from "vitest";
import { initialiseEERoutes } from "../../src/routes/v1";

beforeAll(async () => {
  // Only initialize EE routes if SKIP_EE_TESTS is not set
  if (!process.env.SKIP_EE_TESTS) {
    await initialiseEERoutes();
  }
});
