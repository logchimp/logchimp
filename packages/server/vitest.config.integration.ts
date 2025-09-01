import { defineConfig } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    globals: true,
    setupFiles: [
      "./vitest.setup.integration.ts"
    ],
    dir: "./tests/integration",
  },
});
