// packages/server/src/utils/logchimpConfig.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";

// We need to control the module under test, so we mock the dependencies first
vi.mock("fs");
vi.mock("fs-extra");
vi.mock("./logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock("../../package.json", () => ({
  default: { version: "1.2.3-test" },
}));
vi.mock("../helpers", () => ({
  isDevTestEnv: false, // default; we override per-test when needed
}));

import logger from "./logger";

// Re-import after mocks so we get a fresh ConfigManager each time we reset modules
async function loadConfigManager() {
  // Clear the module cache so constructor + private helpers are re-evaluated
  vi.resetModules();
  const mod = await import("./logchimpConfig");
  return mod;
}

describe("LogChimp Config Manager", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    // Clear any previous mocks
    vi.clearAllMocks();
    // Default: no config file
    (fs.existsSync as any).mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ---------------------------------------------------------------
  // 1. Helper functions – tested indirectly via public API
  //    (they are private, so we exercise every branch through getConfig)
  // ---------------------------------------------------------------

  describe("envString helper", () => {
    it("returns undefined when value is undefined and no fallback", async () => {
      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.secretKey).toBeUndefined();
    });

    it("returns empty string when fallback is empty string", async () => {
      // version is forced to packageJson.version, but we can still check trimming
      process.env.LOGCHIMP_SECRET_KEY = "   ";
      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.secretKey).toBe(""); // trimmed empty
    });

    it("trims whitespace from string values", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "  my-secret  ";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().secretKey).toBe("my-secret");
    });

    it("handles empty string value", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().secretKey).toBe("");
    });
  });

  describe("envNumber helper", () => {
    it("uses default when value is undefined", async () => {
      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.serverPort).toBe(8000);
      expect(cfg.databasePort).toBe(5432);
      expect(cfg.mailPort).toBe(465);
    });

    it("uses default when value is null (from config file)", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: { port: null },
        database: { port: null },
        mail: { port: null },
      });

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.serverPort).toBe(8000);
      expect(cfg.databasePort).toBe(5432);
      expect(cfg.mailPort).toBe(465);
    });

    it("parses string number correctly", async () => {
      process.env.LOGCHIMP_SERVER_PORT = "9000";
      process.env.LOGCHIMP_DB_PORT = "5433";
      process.env.LOGCHIMP_MAIL_PORT = "587";

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.serverPort).toBe(9000);
      expect(cfg.databasePort).toBe(5433);
      expect(cfg.mailPort).toBe(587);
    });

    it("parses string number with whitespace", async () => {
      process.env.LOGCHIMP_SERVER_PORT = "  9001  ";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().serverPort).toBe(9001);
    });

    it("falls back to default on invalid string (NaN)", async () => {
      process.env.LOGCHIMP_SERVER_PORT = "not-a-number";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().serverPort).toBe(8000);
    });

    it("accepts numeric value directly from config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: { port: 3000 },
        database: { port: 5434 },
        mail: { port: 25 },
      });

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.serverPort).toBe(3000);
      expect(cfg.databasePort).toBe(5434);
      expect(cfg.mailPort).toBe(25);
    });

    it("prefers PORT env var when LOGCHIMP_SERVER_PORT is missing", async () => {
      process.env.PORT = "4000";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().serverPort).toBe(4000);
    });

    it("LOGCHIMP_SERVER_PORT takes precedence over PORT", async () => {
      process.env.PORT = "4000";
      process.env.LOGCHIMP_SERVER_PORT = "5000";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().serverPort).toBe(5000);
    });
  });

  describe("envBoolean helper", () => {
    it("returns false when value is undefined", async () => {
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(false);
    });

    it("returns true for string 'true'", async () => {
      process.env.LOGCHIMP_DB_SSL = "true";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(true);
    });

    it("returns false for string 'false'", async () => {
      process.env.LOGCHIMP_DB_SSL = "false";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(false);
    });

    it("returns false for any other string", async () => {
      process.env.LOGCHIMP_DB_SSL = "yes";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(false);
    });

    it("trims string before comparison", async () => {
      process.env.LOGCHIMP_DB_SSL = "  true  ";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(true);
    });

    it("accepts boolean true from config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        database: { ssl: true },
      });
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(true);
    });

    it("accepts boolean false from config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        database: { ssl: false },
      });
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(false);
    });

    it("string 'true' in config file works", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        database: { ssl: "true" },
      });
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().databaseSsl).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // 2. isSelfHosted special handling
  // ---------------------------------------------------------------

  describe("isSelfHosted", () => {
    it("defaults to false / undefined when not set", async () => {
      const { configManager } = await loadConfigManager();
      // In env path it becomes boolean false
      expect(configManager.getConfig().isSelfHosted).toBe(false);
    });

    it("true from env LOGCHIMP_IS_SELF_HOSTED=true", async () => {
      process.env.LOGCHIMP_IS_SELF_HOSTED = "true";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().isSelfHosted).toBe(true);
    });

    it("false from env LOGCHIMP_IS_SELF_HOSTED=false", async () => {
      process.env.LOGCHIMP_IS_SELF_HOSTED = "false";
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().isSelfHosted).toBe(false);
    });

    it("true from config file boolean", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: { selfHosted: true },
      });
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().isSelfHosted).toBe(true);
    });

    it("true from config file string 'true'", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: { selfHosted: "true" },
      });
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().isSelfHosted).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // 3. Config file presence & reading
  // ---------------------------------------------------------------

  describe("hasConfigFile / getConfigFile", () => {
    it("returns false when file does not exist", async () => {
      (fs.existsSync as any).mockReturnValue(false);
      const { configManager } = await loadConfigManager();
      expect(configManager.hasConfigFile()).toBe(false);
    });

    it("returns true when file exists", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({});
      const { configManager } = await loadConfigManager();
      expect(configManager.hasConfigFile()).toBe(true);
    });

    it("reads all supported keys from config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: {
          secretKey: "file-secret",
          machineSignature: "file-sig",
          selfHosted: true,
          apiUrl: "https://api.example.com",
          host: "0.0.0.0",
          port: 8080,
          webUrl: "https://app.example.com",
        },
        license: {
          key: "file-license",
          signature: "file-license-sig",
          pilotUrl: "https://pilot.example.com",
        },
        database: {
          url: "postgres://file",
          host: "db.file",
          user: "fileuser",
          password: "filepass",
          port: 5433,
          name: "filedb",
          ssl: true,
        },
        cache: {
          prefix: "file-prefix",
          url: "valkey://file",
        },
        mail: {
          host: "smtp.file",
          user: "mailuser",
          password: "mailpass",
          port: 587,
        },
        oidc: {
          clientId: "file-oidc-id",
          clientSecret: "file-oidc-secret",
          issuer: "https://oidc.file",
        },
      });

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();

      expect(cfg.secretKey).toBe("file-secret");
      expect(cfg.machineSignature).toBe("file-sig");
      expect(cfg.isSelfHosted).toBe(true);
      expect(cfg.apiUrl).toBe("https://api.example.com");
      expect(cfg.serverHost).toBe("0.0.0.0");
      expect(cfg.serverPort).toBe(8080);
      expect(cfg.webUrl).toBe("https://app.example.com");
      expect(cfg.licenseKey).toBe("file-license");
      expect(cfg.licenseSignature).toBe("file-license-sig");
      // pilotUrl is cleared in non-dev when licenseKey exists – see merge tests
      expect(cfg.databaseUrl).toBe("postgres://file");
      expect(cfg.databaseHost).toBe("db.file");
      expect(cfg.databaseUser).toBe("fileuser");
      expect(cfg.databasePassword).toBe("filepass");
      expect(cfg.databasePort).toBe(5433);
      expect(cfg.databaseName).toBe("filedb");
      expect(cfg.databaseSsl).toBe(true);
      expect(cfg.cachePrefix).toBe("file-prefix");
      expect(cfg.cacheUrl).toBe("valkey://file");
      expect(cfg.mailHost).toBe("smtp.file");
      expect(cfg.mailUser).toBe("mailuser");
      expect(cfg.mailPassword).toBe("mailpass");
      expect(cfg.mailPort).toBe(587);
      expect(cfg.oidcClientId).toBe("file-oidc-id");
      expect(cfg.oidcClientSecret).toBe("file-oidc-secret");
      expect(cfg.oidcIssuer).toBe("https://oidc.file");
      expect(cfg.version).toBe("1.2.3-test");
    });
  });

  // ---------------------------------------------------------------
  // 4. Environment variable reading
  // ---------------------------------------------------------------

  describe("getEnvConfig", () => {
    it("reads every supported environment variable", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "env-secret";
      process.env.LOGCHIMP_MACHINE_SIGNATURE = "env-sig";
      process.env.LOGCHIMP_IS_SELF_HOSTED = "true";
      process.env.LOGCHIMP_API_URL = "https://api.env";
      process.env.LOGCHIMP_API_HOST = "1.2.3.4";
      process.env.LOGCHIMP_SERVER_PORT = "9000";
      process.env.LOGCHIMP_WEB_URL = "https://web.env";
      process.env.LOGCHIMP_LICENSE_KEY = "env-license";
      process.env.LOGCHIMP_SIGNATURE_TOKEN = "env-license-sig";
      process.env.LOGCHIMP_PILOT_URL = "https://pilot.env";
      process.env.LOGCHIMP_DB_URL = "postgres://env";
      process.env.LOGCHIMP_DB_HOST = "db.env";
      process.env.LOGCHIMP_DB_USER = "envuser";
      process.env.LOGCHIMP_DB_PASSWORD = "envpass";
      process.env.LOGCHIMP_DB_PORT = "5435";
      process.env.LOGCHIMP_DB_DATABASE = "envdb";
      process.env.LOGCHIMP_DB_SSL = "true";
      process.env.LOGCHIMP_CACHE_PREFIX = "env-prefix";
      process.env.LOGCHIMP_VALKEY_URL = "valkey://env";
      process.env.LOGCHIMP_MAIL_HOST = "smtp.env";
      process.env.LOGCHIMP_MAIL_USER = "envmail";
      process.env.LOGCHIMP_MAIL_PASSWORD = "envmailpass";
      process.env.LOGCHIMP_MAIL_PORT = "465";
      process.env.LOGCHIMP_OIDC_CLIENT_ID = "env-oidc-id";
      process.env.LOGCHIMP_OIDC_CLIENT_SECRET = "env-oidc-secret";
      process.env.LOGCHIMP_OIDC_ISSUER = "https://oidc.env";

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();

      expect(cfg.secretKey).toBe("env-secret");
      expect(cfg.machineSignature).toBe("env-sig");
      expect(cfg.isSelfHosted).toBe(true);
      expect(cfg.apiUrl).toBe("https://api.env");
      expect(cfg.serverHost).toBe("1.2.3.4");
      expect(cfg.serverPort).toBe(9000);
      expect(cfg.webUrl).toBe("https://web.env");
      expect(cfg.licenseKey).toBe("env-license");
      expect(cfg.licenseSignature).toBe("env-license-sig");
      expect(cfg.databaseUrl).toBe("postgres://env");
      expect(cfg.databaseHost).toBe("db.env");
      expect(cfg.databaseUser).toBe("envuser");
      expect(cfg.databasePassword).toBe("envpass");
      expect(cfg.databasePort).toBe(5435);
      expect(cfg.databaseName).toBe("envdb");
      expect(cfg.databaseSsl).toBe(true);
      expect(cfg.cachePrefix).toBe("env-prefix");
      expect(cfg.cacheUrl).toBe("valkey://env");
      expect(cfg.mailHost).toBe("smtp.env");
      expect(cfg.mailUser).toBe("envmail");
      expect(cfg.mailPassword).toBe("envmailpass");
      expect(cfg.mailPort).toBe(465);
      expect(cfg.oidcClientId).toBe("env-oidc-id");
      expect(cfg.oidcClientSecret).toBe("env-oidc-secret");
      expect(cfg.oidcIssuer).toBe("https://oidc.env");
      expect(cfg.version).toBe("1.2.3-test");
    });
  });

  // ---------------------------------------------------------------
  // 5. Merge precedence (file overwrites env in the current implementation)
  // ---------------------------------------------------------------

  describe("mergeConfigs precedence", () => {
    it("file values override env values (current implementation)", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "env-secret";
      process.env.LOGCHIMP_WEB_URL = "https://env.web";

      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: {
          secretKey: "file-secret",
          webUrl: "https://file.web",
        },
      });

      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();

      // Current merge: { ...envConfig, ...(fileConfig || {}) }
      expect(cfg.secretKey).toBe("file-secret");
      expect(cfg.webUrl).toBe("https://file.web");
    });

    // it("falls back to env when file does not provide a key", async () => {
    //   process.env.LOGCHIMP_SECRET_KEY = "env-secret";
    //   process.env.LOGCHIMP_WEB_URL = "https://env.web";
    //
    //   (fs.existsSync as any).mockReturnValue(true);
    //   (fsExtra.readJsonSync as any).mockReturnValue({
    //     server: { host: "file-host" },
    //   });
    //
    //   const { configManager } = await loadConfigManager();
    //   const cfg = configManager.getConfig();
    //
    //   expect(cfg.secretKey).toBe("env-secret");
    //   expect(cfg.webUrl).toBe("https://env.web");
    //   expect(cfg.serverHost).toBe("file-host");
    // });

    it("always sets version from package.json", async () => {
      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().version).toBe("1.2.3-test");
    });
  });

  // ---------------------------------------------------------------
  // 6. License pilot URL clearing (non-dev environments)
  // ---------------------------------------------------------------

  describe("licensePilotUrl clearing", () => {
    it("clears pilotUrl from env when licenseKey is present (non-dev)", async () => {
      process.env.LOGCHIMP_LICENSE_KEY = "some-key";
      process.env.LOGCHIMP_PILOT_URL = "https://pilot.env";

      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().licensePilotUrl).toBeUndefined();
    });

    it("clears pilotUrl from file when present (non-dev)", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        license: {
          key: "file-key",
          pilotUrl: "https://pilot.file",
        },
      });

      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().licensePilotUrl).toBeUndefined();
    });

    it("keeps pilotUrl in dev/test environment", async () => {
      // Force isDevTestEnv = true for this test
      vi.doMock("../helpers", () => ({ isDevTestEnv: true }));
      process.env.LOGCHIMP_LICENSE_KEY = "some-key";
      process.env.LOGCHIMP_PILOT_URL = "https://pilot.env";

      const { configManager } = await loadConfigManager();
      expect(configManager.getConfig().licensePilotUrl).toBe(
        "https://pilot.env",
      );

      // restore
      vi.doMock("../helpers", () => ({ isDevTestEnv: false }));
    });
  });

  // ---------------------------------------------------------------
  // 7. Caching & reload
  // ---------------------------------------------------------------

  describe("caching and reload", () => {
    it("caches the config on first getConfig()", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "first";
      const { configManager } = await loadConfigManager();

      const first = configManager.getConfig();
      process.env.LOGCHIMP_SECRET_KEY = "second"; // change after load
      const second = configManager.getConfig();

      expect(first).toBe(second); // same object reference
      expect(second.secretKey).toBe("first");
    });

    it("reload() forces a fresh load", async () => {
      process.env.LOGCHIMP_SECRET_KEY = "first";
      const { configManager } = await loadConfigManager();

      const first = configManager.getConfig();
      process.env.LOGCHIMP_SECRET_KEY = "second";
      const reloaded = configManager.reload();

      expect(reloaded).not.toBe(first);
      expect(reloaded.secretKey).toBe("second");
      expect(configManager.getConfig().secretKey).toBe("second");
    });
  });

  // ---------------------------------------------------------------
  // 8. Warnings & deprecations
  // ---------------------------------------------------------------

  describe("warnings and deprecation notices", () => {
    it("warns when LOGCHIMP_WEB_URL is missing", async () => {
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("'LOGCHIMP_WEB_URL' variable is missing"),
      );
    });

    it("does not warn about missing webUrl when it is present", async () => {
      process.env.LOGCHIMP_WEB_URL = "https://example.com";
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      const webUrlWarn = (logger.warn as any).mock.calls.find((c: any[]) =>
        c[0].includes("LOGCHIMP_WEB_URL"),
      );
      expect(webUrlWarn).toBeUndefined();
    });

    it("always warns about default mail port deprecation", async () => {
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("mail configuration default port '465'"),
      );
    });

    it("logs deprecation for LOGCHIMP_MAIL_SERVICE", async () => {
      process.env.LOGCHIMP_MAIL_SERVICE = "smtp";
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          "'LOGCHIMP_MAIL_SERVICE' variable is deprecated",
        ),
      );
    });

    it("logs deprecation for LOGCHIMP_THEME_STANDALONE", async () => {
      process.env.LOGCHIMP_THEME_STANDALONE = "true";
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          "'LOGCHIMP_THEME_STANDALONE' variable is deprecated",
        ),
      );
    });

    it("logs deprecation for mail.service in config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        mail: { service: "smtp" },
      });
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("'mail.service' key is deprecated"),
      );
    });

    it("logs deprecation for theme.standalone in config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        theme: { standalone: true },
      });
      const { configManager } = await loadConfigManager();
      configManager.getConfig();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("'theme.standalone' key is deprecated"),
      );
    });
  });

  // ---------------------------------------------------------------
  // 9. Custom config path
  // ---------------------------------------------------------------

  // describe("custom config path", () => {
  //   it("accepts a custom path in the constructor", async () => {
  //     const customPath = "/tmp/custom-logchimp.config.json";
  //     (fs.existsSync as any).mockImplementation((p: string) => p === customPath);
  //     (fsExtra.readJsonSync as any).mockReturnValue({
  //       server: { secretKey: "custom-path-secret" },
  //     });
  //
  //     const { ConfigManager } = await loadConfigManager();
  //     // If ConfigManager is not exported, you may need to export it for testing
  //     // or test via the singleton after re-creating it.
  //     // Assuming you export the class for testability:
  //     const manager = new (ConfigManager as any)(customPath);
  //     expect(manager.hasConfigFile()).toBe(true);
  //     expect(manager.getConfig().secretKey).toBe("custom-path-secret");
  //   });
  // });

  // ---------------------------------------------------------------
  // 10. Edge-case combinations
  // ---------------------------------------------------------------

  describe("edge cases", () => {
    it("handles completely empty config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({});
      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();

      expect(cfg.serverPort).toBe(8000);
      expect(cfg.databasePort).toBe(5432);
      expect(cfg.mailPort).toBe(465);
      expect(cfg.databaseSsl).toBe(false);
      expect(cfg.version).toBe("1.2.3-test");
    });

    it("handles missing nested objects in config file", async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fsExtra.readJsonSync as any).mockReturnValue({
        server: null,
        database: undefined,
      });
      const { configManager } = await loadConfigManager();
      // Should not throw and should fall back to defaults / env
      expect(() => configManager.getConfig()).not.toThrow();
    });

    it("trims all string env values", async () => {
      process.env.LOGCHIMP_API_URL = "  https://api.trimmed  ";
      process.env.LOGCHIMP_DB_HOST = "\tdb.trimmed\n";
      const { configManager } = await loadConfigManager();
      const cfg = configManager.getConfig();
      expect(cfg.apiUrl).toBe("https://api.trimmed");
      expect(cfg.databaseHost).toBe("db.trimmed");
    });
  });
});
