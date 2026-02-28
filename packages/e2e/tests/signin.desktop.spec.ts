import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";
import { SITE_LOGO_URL, SITE_NAME } from "../helpers/constants";

test.describe("Signin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test.describe("Header", () => {
    test("should display LogChimp branding", async ({ page }) => {
      const siteBranding = page.getByTestId("site-branding");
      await expect(siteBranding).toBeVisible();
      await expect(siteBranding).toHaveAttribute("href", "/");

      // Site logo
      const logo = siteBranding.getByRole("img");
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute("src", SITE_LOGO_URL);
      await expect(logo).toHaveAttribute("alt", SITE_NAME);

      // Site name
      const siteName = siteBranding.getByTestId("site-name");
      await expect(siteName).toBeVisible();
      await expect(siteName).toHaveText(SITE_NAME);
    });

    test.skip("should display heading 'Welcome back!'", async () => {});
  });

  test.describe("Footer", () => {
    test("should have link to password reset page", async ({ page }) => {
      const forgotPasswordLink = page.getByRole("link", {
        name: "Forgot password?",
      });

      await expect(forgotPasswordLink).toBeVisible();
      await expect(forgotPasswordLink).toHaveAttribute(
        "href",
        "/password-reset",
      );
    });

    test("should have link to sign up page", async ({ page }) => {
      const signUpLink = page.getByRole("link", { name: "Sign up" });

      await expect(signUpLink).toBeVisible();
      await expect(signUpLink).toHaveAttribute("href", "/join");
    });
  });

  test.describe("Form", () => {
    test("should render sign-in form", async ({ page }) => {
      const form = page.getByTestId("login-form");
      await expect(form).toBeVisible();

      const emailInput = await form.getByLabel("Email Address");
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(emailInput).toHaveAttribute("placeholder", "Email address");

      const passwordInput = form.getByLabel("password");
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(passwordInput).toHaveAttribute("placeholder", "Password");

      const submitButton = form.getByRole("button", { name: "Login" });
      await expect(submitButton).toBeVisible();
      // await expect(submitButton).toHaveAttribute("type", "submit");
      // await expect(submitButton).toHaveAttribute("disabled");
    });

    test.skip("should display 'Required' error message on empty fields", async ({
      page,
    }) => {
      const form = page.getByTestId("login-form");
      const submitButton = form.getByRole("button", { name: "Login" });
      await submitButton.click();

      const _emailInput = form.getByLabel("Email Address");
      const _passwordInput = form.getByLabel("password");
    });

    test.skip("should display error message when email is invalid", async ({
      page,
    }) => {
      const form = page.getByTestId("login-form");

      const emailInput = form.getByLabel("Email Address");
      await emailInput.fill("invalid-email");

      const passwordInput = form.getByLabel("password");
      await passwordInput.fill("p");

      const submitButton = form.getByRole("button", { name: "Login" });
      await submitButton.click();
    });

    test.skip("should display 'User not found' error", () => {});
    test.skip("should display 'Incorrect password' error", () => {});
    test.skip("should login to user account using valid credentials", () => {});
  });
});
