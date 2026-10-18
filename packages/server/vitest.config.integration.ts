import { defineConfig } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["./tests/integration/**", "./tests/ee/integration/**"],
    setupFiles: ["./tests/integration/setup.ts"],
  },
});
