import { defineConfig } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineConfig({
  ...baseConfig,
  test: {
    dir: "./tests/integration",
  },
});
