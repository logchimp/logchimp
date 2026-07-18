import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { generateContent } from "./generateContent";
import { LOGCHIMP_FALLBACK_BRAND_COLOR } from "../../constants";

describe("generateContent", () => {
  it("should return undefined for invalid template", async () => {
    const result = await generateContent("invalid-template", {
      recipientEmail: faker.internet.email(),
      url: "https://test.com",
      domain: "test.com",
      resetLink: "https://test.com/reset",
      siteTitle: "Test",
      brandColor: "#000",
      siteLogo: "https://test.com/logo.png",
    });

    expect(result).toBeUndefined();
  });

  const customColor = "#ff6600";
  [
    {
      title: "should handle different site colors",
      brandColor: customColor,
      expectedColor: customColor,
    },
    {
      title: "should use fallback brand color when brandColor is not provided",
      brandColor: undefined,
      expectedColor: LOGCHIMP_FALLBACK_BRAND_COLOR,
    },
    // TODO: Add support for invalid color fallback in the logic
    {
      title: "should handle different site colors",
      brandColor: "#invalid-color",
      skip: true,
    },
  ].map(({ title, brandColor, expectedColor, skip }) =>
    it(title, async (t) => {
      if (skip) t.skip();

      const result = await generateContent("reset", {
        recipientEmail: faker.internet.email(),
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Custom Site",
        brandColor,
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.html).toContain(`background-color: ${expectedColor}`);
    }),
  );

  it("should generate plain text version", async () => {
    const result = await generateContent("reset", {
      recipientEmail: faker.internet.email(),
      url: "https://test.com",
      domain: "test.com",
      resetLink: "https://test.com/reset",
      siteTitle: "Test",
      brandColor: "#000",
      siteLogo: "https://test.com/logo.png",
    });

    expect(result?.text).toBeDefined();
    expect(result?.text).toContain("Reset password");
    expect(result?.text).toContain("test.com");
  });

  describe("Password Reset Email", () => {
    it("should generate email with correct dynamic values", async () => {
      const DOMAIN = "example.com";
      const mockData = {
        recipientEmail: faker.internet.email(),
        url: `https://${DOMAIN}`,
        domain: DOMAIN,
        resetLink: `https://${DOMAIN}/reset?token=abc123`,
        siteTitle: "Test Site",
        brandColor: LOGCHIMP_FALLBACK_BRAND_COLOR,
        siteLogo: `https://${DOMAIN}/logo.png`,
      };

      const result = await generateContent("reset", mockData);

      expect(result).toBeDefined();
      expect(result?.html).toContain(mockData.resetLink);
      expect(result?.html).toContain(mockData.siteTitle);
      expect(result?.html).toContain(
        `background-color: ${mockData.brandColor}`,
      );
      expect(result?.html).toContain(`src="${mockData.siteLogo}"`);
      expect(result?.html).toContain(`href="${mockData.url}"`);
      expect(result?.text).toContain(mockData.domain);
    });
  });

  describe("Account verification email", () => {
    const DOMAIN = "example.com";

    it("should generate email with correct dynamic values", async () => {
      const mockData = {
        recipientEmail: faker.internet.email(),
        url: `https://${DOMAIN}`,
        domain: DOMAIN,
        verificationLink: `https://${DOMAIN}/email-verify?token=abc123`,
        siteTitle: "Test Site",
        brandColor: LOGCHIMP_FALLBACK_BRAND_COLOR,
        siteLogo: `https://${DOMAIN}/logo.png`,
      };

      const result = await generateContent("verify", mockData);

      expect(result).toBeDefined();
      expect(result?.html).toContain(mockData.verificationLink);
      expect(result?.html).toContain(mockData.siteTitle);
      expect(result?.html).toContain(
        `background-color: ${mockData.brandColor}`,
      );
      expect(result?.html).toContain(`src="${mockData.siteLogo}"`);
      expect(result?.html).toContain(`href="${mockData.url}"`);
      expect(result?.text).toContain(mockData.domain);
    });
  });
});
