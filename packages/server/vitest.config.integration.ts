import { configDefaults, defineConfig } from "vitest/config";

const integrationTestInclude = [
  "./tests/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
  "./tests/ee/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
];

const setupFiles = ["./tests/integration/setup.ts"];

// `setup.spec.ts` calls `cleanDb()`, which deletes every user. Running it
// alongside the rest of the integration suite causes a race where a spec
// seeds a user and then hits an auth endpoint only to find the user deleted
// (`404 USER_NOT_FOUND`). Run it in its own group first, so it can never
// overlap with the other files. Any future project must use a strictly higher
// `groupOrder` to keep this guarantee.
const setupSpec = "./tests/integration/v1/auth/setup.spec.ts";

export default defineConfig({
  test: {
    projects: [
      {
        extends: "./vitest.config.base.ts",
        test: {
          name: "setup",
          include: [setupSpec],
          setupFiles,
          sequence: { groupOrder: 0 },
        },
      },
      {
        extends: "./vitest.config.base.ts",
        test: {
          name: "integration",
          include: integrationTestInclude,
          exclude: [...configDefaults.exclude, setupSpec],
          setupFiles,
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
