/// <reference types="vitest" />

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [Vue()],
  test: {
    projects: ["./src/components/ui/input/Toggle.test.ts"],
    globals: true,
    environment: "jsdom",
    browser: {
      provider: "playwright",
      enabled: true,
      instances: [
        {
          browser: "chromium",
        }
      ]
    }
  },
});
