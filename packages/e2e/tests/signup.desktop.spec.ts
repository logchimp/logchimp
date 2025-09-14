import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";

test.describe("Signup", (): void => {
  test.beforeEach(async ({ page }) => {
    page.goto("/join");
  });

  test.describe("Header", (): void => {
    test("should display LogChimp branding", async ({ page }) => {
      const siteBranding = page.getByTestId("site-branding");
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

  test.describe("Footer", (): void => {
    test("should have link to login page", async ({ page }) => {
      const signUpLink = page.getByRole("link", { name: "Log in" });

      expect(signUpLink).toBeDefined();
      await expect(signUpLink).toHaveAttribute("href", "/login");
    });
  });
});
