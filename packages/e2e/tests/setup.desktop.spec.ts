import { expect } from "@playwright/test";

import { test } from "../fixtures/pageTest";
import { faker } from "@faker-js/faker";

test.skip("Setup", async ({ page }) => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup/create-account");
  });

  if (page.url() === "/setup/create-account") {
    const ownerAccountForm = page.getByTestId("owner-account-form");

    const siteTitle = ownerAccountForm.getByPlaceholder("My awesome site");
    const newSiteName = faker.company.name();
    await siteTitle.fill(newSiteName);

    const fullName = ownerAccountForm.getByPlaceholder("Mike M. Smit");
    await fullName.fill("e2e Admin");

    const email = ownerAccountForm.getByPlaceholder("Eg. email@example.com");
    await email.fill("e2e@logchimp.com");

    const password = ownerAccountForm.getByPlaceholder("At least 10 character");
    await password.fill("password");

    const createAccountButton = ownerAccountForm.getByRole("button", {
      name: "Create account",
    });
    await createAccountButton.click();
    await page.waitForLoadState("networkidle");

    await page.locator('a[href="/dashboard"]:has-text("skip")').click();
    await expect(page).toHaveURL("/dashboard");
  } else {
    const email = page.locator("input[placeholder='Email address']");
    await email.fill("e2e@logchimp.com", { timeout: 1000 });

    const password = page.locator("input[placeholder='Password']");
    await password.fill("password", { timeout: 1000 });

    const submitButton = page.locator("button:has-text(' Login ')");
    await submitButton.click({ delay: 1000, noWaitAfter: true });

    await expect(page).toHaveURL("/dashboard");
  }
});
