import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";

test.describe("Homepage", (): void => {
  test.describe("Header", (): void => {
    test("should display LogChimp branding", async ({ page }) => {
      const header = page.getByTestId("header");

      // page.test

      expect(header).toBeDefined();
      await expect(header).toHaveCSS("background-color", "rgb(72, 77, 124)");

      // Site name
      const siteName = header.getByTestId("site-name");
      expect(siteName).toBeDefined();
      await expect(siteName).toContainText("LogChimp");
    });
  });
});
