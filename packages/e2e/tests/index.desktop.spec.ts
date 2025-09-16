import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";

test.describe("Homepage", (): void => {
  test.describe("Header", (): void => {
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
      await expect(logo).toHaveAttribute(
        "src",
        "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png",
      );
      await expect(logo).toHaveAttribute("alt", "LogChimp");

      // Site name
      const siteName = siteBranding.getByTestId("site-name");
      expect(siteName).toBeDefined();
      await expect(siteName).toHaveText("LogChimp");
    });
  });
});
