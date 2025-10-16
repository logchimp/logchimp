import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

import { test } from "../fixtures/pageTest";

test.describe("Settings", (): void => {
  test.describe("Email verification", (): void => {
    test.skip("should display 'Email verification' alert for un-verified users", async () => {});
    test.skip("should show success status after clicking 'Resend' button", async () => {});
    // BTW, we can test this case by intercepting the API request
    test.skip("should show failed status after clicking 'Resend' button", async () => {});
  });

  test.describe("User profile form", async () => {
    test("should update 'name' field", async ({ page }) => {
      await page.goto("/settings");
    });
  });
});
