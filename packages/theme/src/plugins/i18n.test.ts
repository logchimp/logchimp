import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const fixtures = vi.hoisted(() => ({
  ce: {
    en: {
      common: { source: "ce", commonOnly: "ce-common", shared: "ce-common" },
      dashboard: {
        source: "ce",
        dashboardOnly: "ce-dashboard",
        shared: "ce-dashboard",
      },
      public: { source: "ce", publicOnly: "ce-public", shared: "ce-public" },
    },
    fr: {
      common: { source: "ce", commonOnly: "ce-common-fr" },
      dashboard: { source: "ce", dashboardOnly: "ce-dashboard-fr" },
      public: { source: "ce", publicOnly: "ce-public-fr" },
    },
    hi: {
      common: { source: "ce", commonOnly: "ce-common-hi" },
      dashboard: { source: "ce", dashboardOnly: "ce-dashboard-hi" },
      public: { source: "ce", publicOnly: "ce-public-hi" },
    },
  },
  ee: {
    en: {
      common: { eeOnly: "ee-common", shared: "ee-common" },
      dashboard: { eeOnly: "ee-dashboard", shared: "ee-dashboard" },
      public: { eeOnly: "ee-public", shared: "ee-public" },
    },
    fr: {
      common: { eeOnly: "ee-common-fr" },
      dashboard: { eeOnly: "ee-dashboard-fr" },
      public: { eeOnly: "ee-public-fr" },
    },
    hi: {
      common: { eeOnly: "ee-common-hi" },
      public: { eeOnly: "ee-public-hi" },
    },
  },
}));

vi.mock("../locales/en/common.json", () => ({
  default: fixtures.ce.en.common,
}));
vi.mock("../locales/en/dashboard.json", () => ({
  default: fixtures.ce.en.dashboard,
}));
vi.mock("../locales/en/public.json", () => ({
  default: fixtures.ce.en.public,
}));
vi.mock("../locales/fr/common.json", () => ({
  default: fixtures.ce.fr.common,
}));
vi.mock("../locales/fr/dashboard.json", () => ({
  default: fixtures.ce.fr.dashboard,
}));
vi.mock("../locales/fr/public.json", () => ({
  default: fixtures.ce.fr.public,
}));
vi.mock("../locales/hi/common.json", () => ({
  default: fixtures.ce.hi.common,
}));
vi.mock("../locales/hi/dashboard.json", () => ({
  default: fixtures.ce.hi.dashboard,
}));
vi.mock("../locales/hi/public.json", () => ({
  default: fixtures.ce.hi.public,
}));

vi.mock("../ee/locales/en/common.json", () => ({
  default: fixtures.ee.en.common,
}));
vi.mock("../ee/locales/en/dashboard.json", () => ({
  default: fixtures.ee.en.dashboard,
}));
vi.mock("../ee/locales/en/public.json", () => ({
  default: fixtures.ee.en.public,
}));
vi.mock("../ee/locales/fr/common.json", () => ({
  default: fixtures.ee.fr.common,
}));
vi.mock("../ee/locales/fr/dashboard.json", () => ({
  default: fixtures.ee.fr.dashboard,
}));
vi.mock("../ee/locales/fr/public.json", () => ({
  default: fixtures.ee.fr.public,
}));
vi.mock("../ee/locales/hi/common.json", () => ({
  default: fixtures.ee.hi.common,
}));
// Simulates an EE namespace that is absent (or fails to load) for a locale.
vi.mock("../ee/locales/hi/dashboard.json", () => {
  throw new Error("Cannot find module '../ee/locales/hi/dashboard.json'");
});
vi.mock("../ee/locales/hi/public.json", () => ({
  default: fixtures.ee.hi.public,
}));

type I18nModule = typeof import("./i18n");

describe("i18n locale loading", () => {
  let i18n: I18nModule["default"];
  let loadLocaleForRoute: I18nModule["loadLocaleForRoute"];

  function messagesFor(locale: string): Record<string, unknown> {
    return i18n.global.getLocaleMessage(locale) as Record<string, unknown>;
  }

  function setMessages(locale: string, messages: Record<string, unknown>) {
    i18n.global.setLocaleMessage(
      locale,
      messages as unknown as Parameters<typeof i18n.global.setLocaleMessage>[1],
    );
  }

  beforeAll(async () => {
    const mod = await import("./i18n");
    i18n = mod.default;
    loadLocaleForRoute = mod.loadLocaleForRoute;
    // The plugin kicks off an initial load for the saved locale on import.
    // Wait for it to settle so it cannot race with the assertions below.
    await vi.waitFor(
      () => {
        expect(messagesFor("en").publicOnly).toBe("ce-public");
      },
      { timeout: 5000 },
    );
  });

  beforeEach(() => {
    setMessages("en", structuredClone(fixtures.ce.en.common));
    setMessages("fr", {});
    setMessages("hi", {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges the EE namespace over the CE namespace", async () => {
    await loadLocaleForRoute("en", "/dashboard");

    const messages = messagesFor("en");
    expect(messages.commonOnly).toBe("ce-common");
    expect(messages.dashboardOnly).toBe("ce-dashboard");
    expect(messages.eeOnly).toBe("ee-dashboard");
    // EE wins on conflicting keys.
    expect(messages.shared).toBe("ee-dashboard");
  });

  it("falls back to the CE namespace when the EE namespace is missing", async () => {
    await loadLocaleForRoute("hi", "/dashboard");

    // The EE dashboard import throws, so the CE messages must survive.
    const messages = messagesFor("hi");
    expect(messages.dashboardOnly).toBe("ce-dashboard-hi");
  });

  it("loads the dashboard namespace for dashboard routes", async () => {
    await loadLocaleForRoute("en", "/dashboard/settings/labs");

    const messages = messagesFor("en");
    expect(messages.commonOnly).toBe("ce-common");
    expect(messages.dashboardOnly).toBe("ce-dashboard");
    expect(messages.publicOnly).toBe("ce-public");
  });

  it("loads the public namespace for non-dashboard routes", async () => {
    await loadLocaleForRoute("en", "/boards");

    const messages = messagesFor("en");
    expect(messages.publicOnly).toBe("ce-public");
    expect(messages.dashboardOnly).toBeUndefined();
  });

  it("keeps previously loaded namespaces after a dashboard -> public transition", async () => {
    await loadLocaleForRoute("en", "/dashboard");
    await loadLocaleForRoute("en", "/");

    const messages = messagesFor("en");
    // The dashboard keys must survive the public route load.
    expect(messages.dashboardOnly).toBe("ce-dashboard");
    expect(messages.eeOnly).toBe("ee-public");
    expect(messages.publicOnly).toBe("ce-public");
  });

  it("keeps previously loaded namespaces after a public -> dashboard transition", async () => {
    await loadLocaleForRoute("en", "/");
    await loadLocaleForRoute("en", "/dashboard");

    const messages = messagesFor("en");

    expect(messages.commonOnly).toBe("ce-common");
    expect(messages.publicOnly).toBe("ce-public");
    expect(messages.dashboardOnly).toBe("ce-dashboard");
  });

  it("keeps previously loaded namespaces for a non-fallback locale", async () => {
    await loadLocaleForRoute("fr", "/dashboard");
    await loadLocaleForRoute("fr", "/");

    const messages = messagesFor("fr");
    expect(messages.commonOnly).toBe("ce-common-fr");
    expect(messages.dashboardOnly).toBe("ce-dashboard-fr");
    expect(messages.publicOnly).toBe("ce-public-fr");

    // The English fallback accumulates across the same transition too.
    const fallback = messagesFor("en");
    expect(fallback.commonOnly).toBe("ce-common");
    expect(fallback.dashboardOnly).toBe("ce-dashboard");
    expect(fallback.publicOnly).toBe("ce-public");
  });

  it("loads common and public namespaces for non-dashboard routes", async () => {
    await loadLocaleForRoute("en", "/boards");

    const messages = messagesFor("en");

    expect(messages.commonOnly).toBe("ce-common");
    expect(messages.publicOnly).toBe("ce-public");
    expect(messages.dashboardOnly).toBeUndefined();
  });

  it("loads common, public, and dashboard namespaces for dashboard routes", async () => {
    await loadLocaleForRoute("en", "/dashboard/settings/labs");

    const messages = messagesFor("en");

    expect(messages.commonOnly).toBe("ce-common");
    expect(messages.publicOnly).toBe("ce-public");
    expect(messages.dashboardOnly).toBe("ce-dashboard");
  });

  it("loads the English fallback messages for a non-fallback locale", async () => {
    await loadLocaleForRoute("fr", "/");

    const fr = messagesFor("fr");
    expect(fr.commonOnly).toBe("ce-common-fr");
    expect(fr.publicOnly).toBe("ce-public-fr");

    const en = messagesFor("en");
    expect(en.commonOnly).toBe("ce-common");
    expect(en.publicOnly).toBe("ce-public");
    expect(en.eeOnly).toBe("ee-public");
  });

  it("skips the fallback pass when the active locale is English", async () => {
    await loadLocaleForRoute("en", "/dashboard");

    const en = messagesFor("en");
    expect(en.dashboardOnly).toBe("ce-dashboard");
    expect(en.eeOnly).toBe("ee-dashboard");
  });

  it("warns and loads nothing for an unsupported locale", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await loadLocaleForRoute("de" as never, "/dashboard");

    expect(warn).toHaveBeenCalledWith("Unsupported locale: de");
    expect(messagesFor("de")).toEqual({});
  });
});
