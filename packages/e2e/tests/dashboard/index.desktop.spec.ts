import { expect } from "@playwright/test";

import { test as userAccount } from "../../fixtures/user-account";
import { test as ownerAccount } from "../../fixtures/owner-account";

userAccount("should not access dashboard via normal user account", async ({ page }) => {
  await page.goto("/dashboard");

  expect(page.url()).toContain("/");
})

ownerAccount("should display 'Powered by LogChimp' badge", async ({ page }) => {
  await page.goto("/dashboard");

  const poweredByLink = page.getByRole("link", {
    name: "Powered by LogChimp",
  });
  expect(poweredByLink).toBeDefined();
});
