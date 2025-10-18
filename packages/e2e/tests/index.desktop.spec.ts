import { expect } from "@playwright/test";

import { test } from "../fixtures/pageTest";
import { SITE_LOGO_URL, SITE_NAME } from "../helpers/constants";

test.describe("Homepage", () => {
  test.describe("Header", () => {
    test("should display LogChimp branding", async ({ page }) => {
      const header = page.getByTestId("header");

      expect(header).toBeDefined();
      await expect(header).toHaveCSS("background-color", "rgb(72, 77, 124)");

      const siteBranding = header.getByTestId("site-branding");
      expect(siteBranding).toBeDefined();
      await expect(siteBranding).toHaveAttribute("href", "/");

      // Site logo
      const logo = siteBranding.getByRole("img");
      expect(logo).toBeDefined();
      await expect(logo).toHaveAttribute("src", SITE_LOGO_URL);
      await expect(logo).toHaveAttribute("alt", SITE_NAME);

      // Site name
      const siteName = siteBranding.getByTestId("site-name");
      expect(siteName).toBeDefined();
      await expect(siteName).toHaveText(SITE_NAME);
    });
  });
});
