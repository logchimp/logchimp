/// <reference types="vitest" />
import { defineProject } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const baseConfig = defineProject({
  test: {
    environment: "node",
    env: {
      ...process.env,
    },
  },
});

export default baseConfig;
