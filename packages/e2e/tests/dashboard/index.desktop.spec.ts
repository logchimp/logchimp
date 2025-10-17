import { expect } from "@playwright/test";

import { test as userAccount } from "../../fixtures/user-account";
import { test as ownerAccount } from "../../fixtures/owner-account";
import { SITE_NAME } from "../../helpers/constants";

userAccount(
  "should not access dashboard via normal user account",
  async ({ page, baseURL }) => {
    await page.goto("/dashboard");

    await page.waitForURL(baseURL);
    expect(page.url()).toEqual(`${baseURL}/`);
  },
);

ownerAccount("should display 'Powered by LogChimp' badge", async ({ page }) => {
  await page.goto("/dashboard");

  const poweredByLink = page.getByRole("link", {
    name: "Powered by LogChimp",
  });

  const url = "https://logchimp.codecarrot.net";
  const params = new URLSearchParams({
    utm_medium: "powered",
    utm_source: "Dashboard overview",
    company: SITE_NAME,
  });
  const expectedUrl = `${url}?${params.toString()}`;

  await expect(poweredByLink).toBeVisible();
  await expect(poweredByLink).toHaveAttribute("href", expectedUrl);
});
