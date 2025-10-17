import { expect } from "@playwright/test";

import { test } from "../fixtures/pageTest";

test.skip("Setup", async ({ page }) => {
  await page.goto("/setup/create-account");

  if (page.url() === "/setup/create-account") {
    const siteTitle = page.locator("input[placeholder='My awesome site']");
    await siteTitle.fill("LogChimp");

    const fullName = page.locator("input[placeholder='Mike M. Smit']");
    await fullName.fill("e2e Admin");

    const email = page.locator("input[placeholder='Eg. email@example.com']");
    await email.fill("e2e@logchimp.com");

    const password = page.locator("input[placeholder='At least 10 character']");
    await password.fill("password");

    await page.locator("text= Create account ").click();
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
