import { expect } from "@playwright/test";
import { test } from "../fixtures/pageTest";

test.describe("Sigin", (): void => {
  test.beforeEach(async ({ page }) => {
    page.goto("/login");
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

    test.skip("should display heading 'Welcome back!'", async () => {});
  });

  test.describe("Footer", (): void => {
    test("should have link to password reset page", async ({ page }) => {
      const forgotPasswordLink = page.getByRole("link", {
        name: "Forgot password?",
      });

      expect(forgotPasswordLink).toBeDefined();
      await expect(forgotPasswordLink).toHaveAttribute(
        "href",
        "/password-reset",
      );
    });

    test("should have link to sign up page", async ({ page }) => {
      const signUpLink = page.getByRole("link", { name: "Sign up" });

      expect(signUpLink).toBeDefined();
      await expect(signUpLink).toHaveAttribute("href", "/join");
    });
  });

  test.describe("Form", (): void => {
    test("should display error message", async ({ page }) => {
      const form = page.getByRole("form");

      const emailInput = form.getByLabel("Email Address");
      expect(emailInput).toBeDefined();
      await expect(emailInput).toHaveAttribute("type", "email");
      await expect(emailInput).toHaveAttribute("placeholder", "Email address");

      const passwordInput = form.getByLabel("password");
      expect(passwordInput).toBeDefined();
      await expect(passwordInput).toHaveAttribute("type", "password");
      await expect(passwordInput).toHaveAttribute("placeholder", "Password");

      const submitButton = form.getByRole("button", { name: "Login" });
      expect(submitButton).toBeDefined();
      // await expect(submitButton).toHaveAttribute("type", "submit");
      // await expect(submitButton).toHaveAttribute("disabled");
    });
  });
});
