import { defineProject } from "vitest/config";

import baseConfig from "./vitest.config.base";

export default defineProject({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    dir: "./tests/unit",
  },
});
