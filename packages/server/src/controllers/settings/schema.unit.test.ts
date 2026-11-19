import { describe, expect, test } from "vitest";
import * as v from "valibot";

import {
  hasSiteNameOrLogo,
  settingsErrorMap,
  updateSiteSettingsRequestBodySchema,
} from "./schema";

const parse = (body: unknown) =>
  v.safeParse(updateSiteSettingsRequestBodySchema, body);

describe("logo", () => {
  test("absent key stays untouched", () => {
    const result = parse({});

    expect(result.success).toBe(true);
    expect(result.output).toEqual({});
    expect("logo" in (result.output as object)).toBe(false);
  });

  test.each([null, ""])("%j clears the logo", (logo) => {
    const result = parse({ logo });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ logo: null });
  });

  test("valid URL is trimmed", () => {
    const result = parse({ logo: "  https://example.com/logo.png  " });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ logo: "https://example.com/logo.png" });
  });

  test.each(["not a url", " ", "javascript:alert(1)"])(
    "rejects invalid logo %j",
    (logo) => {
      const result = parse({ logo });

      expect(result.success).toBe(false);
      expect(result.issues?.[0].message).toBe("INVALID_LOGO_URL");
    },
  );

  test("strips injected attributes and keeps the clean URL", () => {
    const result = parse({
      logo: `https://example.com/image.jpg" onload="alert(1)`,
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ logo: "https://example.com/image.jpg" });
  });

  test("rejects URL longer than 255 characters", () => {
    const result = parse({
      logo: `https://example.com/${"a".repeat(250)}.png`,
    });

    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toBe("LOGO_URL_TOO_LONG");
  });

  test("non-string logo is a validation error, not a throw", () => {
    const result = parse({ logo: 123 });

    expect(result.success).toBe(false);
    expect(settingsErrorMap[result.issues?.[0].message as string]).toBe(
      undefined,
    );
  });
});

describe("accentColor", () => {
  test.each([null, ""])("%j clears the accent color", (accentColor) => {
    const result = parse({ accentColor });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ accentColor: null });
  });

  test("absent key stays untouched", () => {
    const result = parse({ title: "LogChimp" });

    expect(result.output).toEqual({ title: "LogChimp" });
  });

  test.each(["#fff", "#ff00aa", "ff00aa"])("accepts %j", (accentColor) => {
    const result = parse({ accentColor });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ accentColor });
  });

  test("rejects invalid color", () => {
    const result = parse({ accentColor: "not-a-color" });

    expect(result.success).toBe(false);
    const code = result.issues?.[0].message as string;
    expect(code).toBe("INVALID_ACCENT_COLOR");
    expect(settingsErrorMap[code]).toBe("Invalid accent color");
  });
});

describe("other fields", () => {
  test("passes valid values through", () => {
    const body = {
      title: "LogChimp",
      description: "desc",
      allowSignup: true,
      googleAnalyticsId: "G-123",
      developer_mode: false,
    };
    const result = parse(body);

    expect(result.success).toBe(true);
    expect(result.output).toEqual(body);
  });

  test("title, description and googleAnalyticsId may be null", () => {
    const body = { title: null, description: null, googleAnalyticsId: null };
    const result = parse(body);

    expect(result.success).toBe(true);
    expect(result.output).toEqual(body);
  });

  test.each([
    { title: 1 },
    { description: 1 },
    { allowSignup: "yes" },
    { googleAnalyticsId: 1 },
    { developer_mode: "true" },
  ])("rejects wrong type %j", (body) => {
    expect(parse(body).success).toBe(false);
  });

  test("rejects non-object body", () => {
    expect(parse(undefined).success).toBe(false);
  });
});

describe("hasSiteNameOrLogo", () => {
  test("empty title and cleared logo, no current settings", () => {
    expect(hasSiteNameOrLogo({ title: "", logo: null }, undefined)).toBe(false);
  });

  test("whitespace-only title and cleared logo", () => {
    expect(hasSiteNameOrLogo({ title: "   ", logo: null }, undefined)).toBe(
      false,
    );
  });

  test("clearing logo falls back to current title", () => {
    expect(hasSiteNameOrLogo({ logo: null }, { title: "LogChimp" })).toBe(true);
  });

  test("clearing logo with no current title is rejected", () => {
    expect(hasSiteNameOrLogo({ logo: null }, { title: "", logo: "x" })).toBe(
      false,
    );
  });

  test("clearing title falls back to current logo", () => {
    expect(
      hasSiteNameOrLogo({ title: "" }, { logo: "https://example.com/a.png" }),
    ).toBe(true);
  });

  test("clearing title with no current logo is rejected", () => {
    expect(hasSiteNameOrLogo({ title: null }, { title: "x", logo: null })).toBe(
      false,
    );
  });

  test("clearing title with no current settings is rejected", () => {
    expect(hasSiteNameOrLogo({ title: "" }, undefined)).toBe(false);
  });

  test("new logo satisfies the rule", () => {
    expect(
      hasSiteNameOrLogo({ title: "", logo: "https://example.com/a.png" }, {}),
    ).toBe(true);
  });
});
