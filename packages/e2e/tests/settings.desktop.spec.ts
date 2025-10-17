import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

import { test } from "../fixtures/user-account";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("should display 'Settings' heading", async ({ page }) => {
    const heading = page.getByTestId("page-title");
    await expect(heading).toHaveText("Account settings");
  });

  // test.describe("Email verification", () => {
  //   test.skip("should display 'Email verification' alert for un-verified users", async () => {});
  //   test.skip("should show success status after clicking 'Resend' button", async () => {});
  //   // BTW, we can test this case by intercepting the API request
  //   test.skip("should show failed status after clicking 'Resend' button", async () => {});
  // });

  test.describe("Account settings form", async () => {
    test("should have 'username' & 'email' field disabled", async ({
      page,
    }) => {
      const form = page.getByTestId("settings-form");
      const usernameInput = form.getByLabel("Username");
      const emailInput = form.getByLabel("Email");

      await expect(usernameInput).toBeDisabled();
      await expect(emailInput).toBeDisabled();
    });

    test("should update user's name", async ({ page }) => {
      const form = page.getByTestId("settings-form");
      const nameInput = form.getByPlaceholder("Full name");

      const randomName = faker.person.fullName();
      await nameInput.fill(randomName);
      await page.getByRole("button", { name: "Update" }).click();

      // Reload the page and check the name
      await page.reload();
      expect(await nameInput.inputValue()).toBe(randomName);
    });
  });
});
