import { defineProject } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineProject({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    globals: true,
    setupFiles: ["./vitest.setup.integration.ts"],
    dir: "./tests/integration",
  },
});
