import { expect } from "@playwright/test";

import { test as userAccount } from "../../fixtures/user-account";
import { test as ownerAccount } from "../../fixtures/owner-account";
import { SITE_NAME } from "../../helpers/constants";

userAccount(
  "should not access dashboard via normal user account",
  async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for any navigation to complete
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url).not.toContain("/dashboard");
  },
);

ownerAccount("should display 'Powered by LogChimp' badge", async ({ page }) => {
  await page.goto("/dashboard");

  const poweredByLink = page.getByRole("link", {
    name: "Powered by LogChimp",
  });

  const url = "https://logchimp.app";
  const params = new URLSearchParams({
    utm_medium: "powered",
    utm_source: "Dashboard overview",
    company: SITE_NAME,
  });
  const expectedUrl = `${url}?${params.toString()}`;

  await expect(poweredByLink).toBeVisible();
  await expect(poweredByLink).toHaveAttribute("href", expectedUrl);
});
