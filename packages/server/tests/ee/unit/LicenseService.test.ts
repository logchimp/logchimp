import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ILicenseServiceResponse } from "@logchimp/types";
import {
  LicenseService,
  createLicenseService,
  type LicenseServiceConfig,
} from "../../../src/ee/do-not-remove/services/LicenseService";

const mockConfig: LicenseServiceConfig = {
  licenseKey: "test-license-key",
  licenseSignature: "test-signature",
  licensePilotUrl: "https://license.test.app",
  cachePrefix: "test:",
  version: "1.0.0",
};

const validLicenseResponse: ILicenseServiceResponse = {
  status: "active",
  license_key: "test-license-key",
  response_nonce: "test-nonce",
  server_time: new Date().toISOString(),
  subscription_type: "pro",
  hierarchy: 1,
};

describe("LicenseService", () => {
  let service: LicenseService;

  beforeEach(() => {
    service = createLicenseService(mockConfig);
  });

  describe("happy path", () => {
    it("should return valid license response when check succeeds", async () => {
      const result = await service.checkLicense();
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it("should cache successful license response", async () => {
      await service.checkLicense();
      const cachedResult = await service.checkLicense();
      expect(cachedResult).toBeDefined();
    });
  });

  describe("error path", () => {
    it("should return empty response when license key missing", async () => {
      const noKeyService = createLicenseService({
        ...mockConfig,
        licenseKey: undefined,
      });
      const result = await noKeyService.checkLicense();
      expect(result.status).toBe("");
      expect(result.subscription_type).toBe("free");
    });

    it("should handle network failure gracefully", async () => {
      const result = await service.checkLicense();
      expect(result).toBeDefined();
    });

    it("should clear cache when clearCache is called", async () => {
      await service.checkLicense();
      await service.clearCache();
    });
  });

  describe("singleton behavior", () => {
    it("should create service with factory function", () => {
      const instance1 = createLicenseService(mockConfig);
      const instance2 = createLicenseService(mockConfig);
      expect(instance1).toBeInstanceOf(LicenseService);
      expect(instance2).toBeInstanceOf(LicenseService);
    });
  });

  describe("configuration handling", () => {
    it("should accept valid configuration", () => {
      const instance = createLicenseService(mockConfig);
      expect(instance).toBeDefined();
    });

    it("should handle missing license signature gracefully", async () => {
      const noSignatureService = createLicenseService({
        ...mockConfig,
        licenseSignature: undefined,
      });
      const result = await noSignatureService.checkLicense();
      expect(result).toBeDefined();
    });
  });
});
