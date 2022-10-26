/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

const baseConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});

export default baseConfig;
