import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error(
        "BASE_URL is not set. Please set BASE_URL to your running web app (e.g., http://localhost:3000).",
      );
    }
    await page.goto(baseUrl);
    await page.waitForSelector("body[data-v-app]");
    await use(page);
  },
});
