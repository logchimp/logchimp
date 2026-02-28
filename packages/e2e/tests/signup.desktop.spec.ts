import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";
import { SITE_LOGO_URL, SITE_NAME } from "../helpers/constants";

test.describe("Signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/join");
  });

  test.describe("Header", () => {
    test("should display LogChimp branding", async ({ page }) => {
      const siteBranding = page.getByTestId("site-branding");
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

    test.skip("should display heading 'Create your account!'", async () => {});
  });

  test.describe("Footer", () => {
    test("should have link to login page", async ({ page }) => {
      const signUpLink = page.getByRole("link", { name: "Log in" });

      expect(signUpLink).toBeDefined();
      await expect(signUpLink).toHaveAttribute("href", "/login");
    });
  });

  test.describe("Form", () => {
    test("should render sign-up form", async ({ page }) => {
      const form = page.getByTestId("signup-form");
      await expect(form).toBeVisible();

      const emailInput = await form.getByLabel("Email Address");
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(emailInput).toHaveAttribute("placeholder", "Email address");

      const passwordInput = form.getByLabel("password");
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(passwordInput).toHaveAttribute("placeholder", "Password");

      const submitButton = form.getByRole("button", { name: "Create Account" });
      await expect(submitButton).toBeVisible();
      // await expect(submitButton).toHaveAttribute("type", "submit");
      // await expect(submitButton).toHaveAttribute("disabled");
    });

    test.skip("should display 'Required' error message on empty fields", async ({
      page,
    }) => {
      const form = page.getByTestId("signup-form");
      const submitButton = form.getByRole("button", { name: "Login" });
      await submitButton.click();

      const _emailInput = form.getByLabel("Email Address");
      const _passwordInput = form.getByLabel("password");
    });

    test.skip("should display error message when email is invalid", async ({
      page,
    }) => {
      const form = page.getByTestId("signup-form");

      const emailInput = form.getByLabel("Email Address");
      await emailInput.fill("invalid-email");

      const passwordInput = form.getByLabel("password");
      await passwordInput.fill("p");

      const submitButton = form.getByRole("button", { name: "Login" });
      await submitButton.click();
    });

    test.skip("should display 'User exists' error", () => {});
    test.skip("should create user account using valid credentials", () => {});
  });
});
