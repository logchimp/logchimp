import { beforeAll } from "vitest";
import { initialiseEERoutes } from "../../src/routes/v1";

beforeAll(async () => {
  // Only initialize EE routes if SKIP_EE_TESTS is not set to "true"
  if (process.env.SKIP_EE_TESTS !== "true") {
    await initialiseEERoutes();
  }
});
