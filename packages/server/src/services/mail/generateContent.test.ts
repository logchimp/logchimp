import { describe, expect, it } from "vitest";

import { generateContent } from "./generateContent";
import { LOGCHIMP_FALLBACK_BRAND_COLOR } from "../../constants";

describe("generateContent", () => {
  it("should return undefined for invalid template", async () => {
    const result = await generateContent("invalid-template", {
      url: "https://test.com",
      domain: "test.com",
      resetLink: "https://test.com/reset",
      siteTitle: "Test",
      siteColor: "#000",
      siteLogo: "https://test.com/logo.png",
    });

    expect(result).toBeUndefined();
  });

  describe("Password Reset Email", () => {
    it("should generate email with correct dynamic values", async () => {
      const mockData = {
        url: "https://example.com",
        domain: "example.com",
        resetLink: "https://example.com/reset?token=abc123",
        siteTitle: "Test Site",
        siteColor: "#484d7c",
        siteLogo: "https://example.com/logo.png",
      };

      const result = await generateContent("reset", mockData);

      expect(result).toBeDefined();
      expect(result?.html).toContain(mockData.resetLink);
      expect(result?.html).toContain(mockData.siteTitle);
      expect(result?.html).toContain(`background-color: ${mockData.siteColor}`);
      expect(result?.html).toContain(`src="${mockData.siteLogo}"`);
      expect(result?.html).toContain(`href="${mockData.url}"`);
      expect(result?.text).toContain(mockData.domain);
    });

    it("should handle different site colors", async () => {
      const customColor = "#ff6600";
      const result = await generateContent("reset", {
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Custom Site",
        siteColor: customColor,
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.html).toContain(`background-color: ${customColor}`);
    });

    it("should fallback to default LogChimp brand color", async () => {
      const result = await generateContent("reset", {
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Fallback Site",
        siteColor: "#invalid-color",
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.html).toContain(
        `background-color: #${LOGCHIMP_FALLBACK_BRAND_COLOR}`,
      );
    });

    it("should use fallback brand color when siteColor is not provided", async () => {
      const result = await generateContent("reset", {
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Test",
        siteColor: "", // or undefined
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.html).toContain(
        `background-color: #${LOGCHIMP_FALLBACK_BRAND_COLOR}`,
      );
    });

    it.skip("should fallback to default LogChimp brand color on invalid site color", async () => {
      const result = await generateContent("reset", {
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Fallback Site",
        siteColor: "#invalid-color",
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.html).toContain(
        `background-color: #${LOGCHIMP_FALLBACK_BRAND_COLOR}`,
      );
    });

    it("should generate plain text version", async () => {
      const result = await generateContent("reset", {
        url: "https://test.com",
        domain: "test.com",
        resetLink: "https://test.com/reset",
        siteTitle: "Test",
        siteColor: "#000",
        siteLogo: "https://test.com/logo.png",
      });

      expect(result?.text).toBeDefined();
      expect(result?.text).toContain("Reset password");
      expect(result?.text).toContain("test.com");
    });
  });
});
