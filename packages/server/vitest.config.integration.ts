import { defineConfig } from "vitest/config";

import baseConfig from "./vitest.config.base";

const integrationTestInclude = [
  "./tests/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
  "./tests/ee/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
];

// `setup.spec.ts` calls `cleanDb()`, which deletes every user. Running it
// alongside the rest of the integration suite causes a race where a spec
// seeds a user and then hits an auth endpoint only to find the user deleted
// (`404 USER_NOT_FOUND`). Run it in its own group first, so it can never
// overlap with the other files.
const setupSpec = "./tests/integration/v1/auth/setup.spec.ts";

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    projects: [
      {
        test: {
          name: "setup",
          globals: true,
          environment: "node",
          include: [setupSpec],
          setupFiles: ["./tests/integration/setup.ts"],
          sequence: { groupOrder: 0 },
        },
      },
      {
        test: {
          name: "integration",
          globals: true,
          environment: "node",
          include: integrationTestInclude,
          exclude: [setupSpec],
          setupFiles: ["./tests/integration/setup.ts"],
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
