import { defineConfig, devices } from "@playwright/test";
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

const authFile = path.join(__dirname, '.auth/user.json')

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects:
    process.env.CI_BRANCH_NAME === "master"
      ? // CI
        [
          // Setup project
          { name: 'setup', testMatch: /.*\.setup\.ts/ },

          {
            name: "chromium",
            use: { ...devices["Desktop Chrome"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
          // Test against branded browsers
          {
            name: "Microsoft Edge",
            use: {
              ...devices["Desktop Edge"],
              channel: "msedge",
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
          // Mobile
          {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
          {
            name: "Mobile Safari",
            use: {
              ...devices["iPhone 13 Pro"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },
        ]
      : // Dev
        [
          // Setup project
          { name: 'setup', testMatch: /.*\.setup\.ts/ },

          {
            name: "chromium",
            use: { ...devices["Desktop Chrome"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },

          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },

          {
            name: "webkit",
            use: { ...devices["Desktop Safari"],
              storageState: authFile,
            },
            dependencies: [ "setup" ],
          },

          /* Test against mobile viewports. */
          // {
          //   name: 'Mobile Chrome',
          //   use: { ...devices['Pixel 5'] },
          // },
          // {
          //   name: 'Mobile Safari',
          //   use: { ...devices['iPhone 12'] },
          // },
        ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
