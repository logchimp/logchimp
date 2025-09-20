import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";
import { faker } from "@faker-js/faker";

test.describe("Settings", (): void => {
  test.describe("General", (): void => {
    test("should change Site Name", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const siteNameInput = page.locator("input[placeholder='Enter site name']");
      const newSiteName = faker.company.name();

      await siteNameInput.fill(newSiteName);
      await page.getByRole("button", { name: "Save" }).click();

      await page.reload();
      await expect(siteNameInput).toHaveValue(newSiteName);
    });

    test('should display error for empty site name', async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const siteNameInput = page.locator("input[placeholder='Enter site name']");
      // const oldSiteName = await siteNameInput.inputValue();

      await siteNameInput.clear();
      await page.getByRole("button", { name: "Save" }).click();

      // const newSiteName = await page.getByTestId("site-name");

      await expect(siteNameInput).toContainClass("input-error");
      // Bug [https://github.com/logchimp/logchimp/issues/1312]
      // await expect(newSiteName).toHaveText(oldSiteName);
    });

    test("should update 'Description'", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const input = page.locator("input[placeholder='Site description']");
      const new_desc = faker.company.buzzPhrase();

      await input.fill(new_desc);
      await page.getByRole("button", { name: "Save" }).click();

      await page.reload();
      await expect(input).toHaveValue(new_desc);
    });

    test.skip("should toggle 'Allow signups'", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const toggleSelector = "button[aria-label='Allow signups']";
      const toggleButton = page.locator(toggleSelector);
      const initial_toggle_value = await toggleButton.getAttribute('aria-checked');


      await toggleButton.click();
      await page.getByRole('button', { name: 'Save' }).click();

      await page.reload();

      const newToggleButton = page.locator("button[aria-label='Allow signups']");
      const new_toggle_value = await newToggleButton.getAttribute('aria-checked');
      expect(Boolean(initial_toggle_value)).toBe(
        new_toggle_value
      );
    });

    test("should update 'Google Analytics'", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const input = page.locator("input[placeholder='UA-12345678-0']");
      const new_analytics = faker.string.nanoid();

      await input.fill(new_analytics);
      await page.getByRole("button", { name: "Save" }).click();

      await page.reload();
      await expect(input).toHaveValue(new_analytics);
    });

    test.skip("should toggle 'Developer mode'", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const toggleSelector = "button[aria-label='Developer Mode']";
      const toggleButton = page.locator(toggleSelector);
      const initial_toggle_value = await toggleButton.getAttribute('aria-checked');


      await toggleButton.click();
      await page.getByRole('button', { name: 'Save' }).click();

      await page.reload();

      const newToggleButton = page.locator("button[aria-label='Developer Mode']");
      const new_toggle_value = await newToggleButton.getAttribute('aria-checked');
      expect(initial_toggle_value).toBe(
        new_toggle_value
      );
    });

    test("should display 'Powered by LogChimp' badge", async ({ page }) => {
      await page.goto("http://localhost:3000/dashboard/settings/general");
      await expect(page).toHaveURL("http://localhost:3000/dashboard/settings/general");

      const poweredByLink = page.getByRole('link', { name: 'Powered by LogChimp' });

      expect(poweredByLink).toBeDefined();
    });


  });

  test.describe("Email verification", (): void => {
    test.skip("should display 'Email verification' alert for un-verified users", async () => {});
    test.skip("should show success status after clicking 'Resend' button", async () => {});
    // BTW, we can test this case by intercepting the API request
    test.skip("should show failed status after clicking 'Resend' button", async () => {});
  });
});
