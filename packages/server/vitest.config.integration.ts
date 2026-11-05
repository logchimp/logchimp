import { defineConfig } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: [
      "./tests/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      "./tests/ee/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
    ],
    setupFiles: ["./tests/integration/setup.ts"],
  },
});
