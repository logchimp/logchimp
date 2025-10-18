import { expect, type Page } from "@playwright/test";
import { faker } from "@faker-js/faker";

import { test } from "../../../fixtures/owner-account";
import { SITE_LOGO_URL, SITE_NAME } from "../../../helpers/constants";

async function saveButton(page: Page) {
  const button = page.getByRole("button", { name: "Save" });

  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
}

test.describe
  .serial("Dashboard Settings > General", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard/settings/general");
    });

    test.afterEach(async ({ page }) => {
      // Site name
      const siteNameInput = page.getByPlaceholder("Enter site name");
      await siteNameInput.fill(SITE_NAME);

      // Logo
      const logoInput = page.getByTestId("logo-url");
      await logoInput.fill(SITE_LOGO_URL);

      // Description
      const descriptionInput = page.getByPlaceholder("Site description");
      await descriptionInput.clear();

      // Allow signups
      const allowSignupComponent = page.getByTestId("allow-signup");
      const allowSignupToggle = allowSignupComponent.locator(
        'button[data-test="toggle"]',
      );
      const allowSignupIsEnabled =
        await allowSignupToggle.getAttribute("aria-checked");
      if (allowSignupIsEnabled === "false") {
        await allowSignupToggle.click();
      }

      // Developer mode
      const developerModeComponent = page.getByTestId("developer-mode");
      const developerModeToggle = developerModeComponent.locator(
        'button[data-test="toggle"]',
      );
      const developerModeIsEnabled =
        await developerModeToggle.getAttribute("aria-checked");
      if (developerModeIsEnabled === "true") {
        await developerModeToggle.click();
      }

      await saveButton(page);
    })

    test.describe("Site name", () => {
      // test.skip("should display error for empty site name", async ({ page }) => {
      //   const siteNameInput = page.locator(
      //     "input[placeholder='Enter site name']",
      //   );
      //   // const oldSiteName = await siteNameInput.inputValue();
      //
      //   await siteNameInput.clear();
      //   await saveButton(page)
      //   await page.getByRole("button", { name: "Save" }).click();
      //
      //   // const newSiteName = await page.getByTestId("site-name");
      //
      //   await expect(siteNameInput).toContainClass("input-error");
      //   // Bug [https://github.com/logchimp/logchimp/issues/1312]
      //   // await expect(newSiteName).toHaveText(oldSiteName);
      //
      //   await siteNameInput.fill(SITE_NAME);
      //   await resetSiteSettings(page);
      // });

      test("should change Site Name", async ({ page }) => {
        const siteNameInput = page.getByPlaceholder("Enter site name");

        const newSiteName = faker.company.name();
        await siteNameInput.fill(newSiteName);

        await saveButton(page);

        await page.reload();
        await expect(siteNameInput).toHaveValue(newSiteName);
      });
    });

    test("should update 'Description'", async ({ page }) => {
      const input = page.getByPlaceholder("Site description");

      const fakerDescription = faker.company.buzzPhrase();
      await input.fill(fakerDescription);
      await saveButton(page);

      await page.reload();
      await page.waitForSelector("body[data-v-app]");
      await expect(input).toHaveValue(fakerDescription);
    });

    test("should update logo url", async ({ page }) => {
      const logoInput = page.getByTestId("logo-url");

      const fakerImage = faker.image.avatar();
      await logoInput.fill(fakerImage);
      await saveButton(page);

      // TODO: should check the logo update in:
      // - dashboard sidebar
      // - public homepage header

      await page.reload();
      await page.waitForSelector("body[data-v-app]");
      await expect(logoInput).toHaveValue(fakerImage);
    });

    test("should toggle 'Allow signups'", async ({ page }) => {
      const allowSignupComponent = page.getByTestId("allow-signup");
      const allowSignupToggle = allowSignupComponent.locator(
        'button[data-test="toggle"]',
      );

      console.log('first check:', await allowSignupToggle.getAttribute("aria-checked"));
      expect(await allowSignupToggle.getAttribute("aria-checked")).toEqual(
        "true",
      );

      await allowSignupToggle.click();
      console.log('second check:', await allowSignupToggle.getAttribute("aria-checked"));
      expect(await allowSignupToggle.getAttribute("aria-checked")).toEqual(
        "false",
      );
      await saveButton(page);

      await page.reload();
      await page.waitForSelector("body[data-v-app]");
      console.log('third check:', await allowSignupToggle.getAttribute("aria-checked"));
      expect(await allowSignupToggle.getAttribute("aria-checked")).toEqual(
        "false",
      );
    });

    // test.skip("should update 'Google Analytics'", async ({ page }) => {
    //   const input = page.locator("input[placeholder='UA-12345678-0']");
    //   const new_analytics = faker.string.nanoid();
    //
    //   await input.fill(new_analytics);
    //   await page.getByRole("button", { name: "Save" }).click();
    //
    //   await page.reload();
    //   await page.waitForSelector("body[data-v-app]");
    //   await expect(input).toHaveValue(new_analytics);
    // });

    test("should toggle 'Developer mode'", async ({ page }) => {
      const developerModeComponent = page.getByTestId("developer-mode");
      const developerModeToggle = developerModeComponent.locator(
        'button[data-test="toggle"]',
      );

      expect(await developerModeToggle.getAttribute("aria-checked")).toEqual(
        "false",
      );

      await developerModeToggle.click();
      expect(await developerModeToggle.getAttribute("aria-checked")).toEqual(
        "true",
      );
      await saveButton(page);

      await page.reload();
      await page.waitForSelector("body[data-v-app]");
      expect(await developerModeToggle.getAttribute("aria-checked")).toEqual(
        "true",
      );
    });
  });
