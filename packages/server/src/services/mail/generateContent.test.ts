import { describe, expect, it } from "vitest";

import { generateContent } from "./generateContent";

describe("generateContent", () => {
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
