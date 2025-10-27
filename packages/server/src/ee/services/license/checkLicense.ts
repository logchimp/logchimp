import type {
  ICheckLicenseDecryptedPayload,
  ICheckLicenseRequestBody,
  ICheckLicenseResponseBody,
  IApiErrorResponse,
} from "@logchimp/types";
import jwt from "jsonwebtoken";

import { configManager } from "../../../utils/logchimpConfig";
import * as cache from "../../../cache";
import { LOGCHIMP_LICENSE_CACHE_TTL_IN_SEC } from "../../../constants";
import logger from "../../../utils/logger";

const config = configManager.getConfig();

const getLogChimpCacheKey = (licenseKey: string) =>
  `${config.cachePrefix}pilot:key:${licenseKey}`;

const deploymentProvider = getDeploymentProvider();

const EMPTY_LICENSE_RESPONSE: ICheckLicenseDecryptedPayload = {
  status: "",
  license_key: "",
  response_nonce: "",
  server_time: "",
};

// In-memory cache for ultra-fast access
interface IMemoryCache {
  payload: ICheckLicenseDecryptedPayload | IApiErrorResponse | null;
  expiresAt: number;
}
const EMPTY_MEMORY_CACHE: IMemoryCache = {
  payload: null,
  expiresAt: 0,
};
let memoryCache: IMemoryCache = {
  payload: null,
  expiresAt: 0,
};

// Prevent multiple simultaneous license server requests
let pendingLicenseCheck: Promise<ICheckLicenseDecryptedPayload> | null = null;

export async function checkLicense(): Promise<
  ICheckLicenseDecryptedPayload | IApiErrorResponse
> {
  const licenseKey = config.licenseKey;
  if (!licenseKey) {
    return EMPTY_LICENSE_RESPONSE;
  }

  const now = Date.now();
  if (memoryCache.payload && memoryCache.expiresAt > now) {
    return memoryCache.payload;
  }

  if (pendingLicenseCheck) {
    return pendingLicenseCheck;
  }

  pendingLicenseCheck = performLicenseCheck(licenseKey, now);

  try {
    const result = await pendingLicenseCheck;
    return result;
  } finally {
    pendingLicenseCheck = null;
  }
}

async function performLicenseCheck(
  licenseKey: string,
  now: number,
): Promise<ICheckLicenseDecryptedPayload> {
  let encryptedPayload: string | null = null;
  if (cache.isActive) {
    try {
      encryptedPayload = await cache.valkey.get(
        getLogChimpCacheKey(licenseKey),
      );
      if (encryptedPayload) {
        const decrypted = await decryptPayload(encryptedPayload);
        updateMemoryCache(decrypted, now);
        return decrypted;
      }
    } catch (e) {
      logger.error({
        message: "error get license encrypted payload from cache",
        error: e,
      });
    }
  }

  try {
    const data = await pingLicenseServer();
    if ("code" in data || !data.encrypted_payload) {
      updateMemoryCache(data as IApiErrorResponse, now);
      return EMPTY_LICENSE_RESPONSE;
    }

    encryptedPayload = data.encrypted_payload;

    if (cache.isActive) {
      try {
        await cache.valkey.set(
          getLogChimpCacheKey(licenseKey),
          encryptedPayload,
          "EX",
          LOGCHIMP_LICENSE_CACHE_TTL_IN_SEC,
        );
      } catch (e) {
        logger.error({
          message: "error cache license encrypted payload response",
          error: e,
        });
      }
    }
  } catch (e) {
    logger.error({
      message: "failed to ping license server",
      error: e,
    });
    return EMPTY_LICENSE_RESPONSE;
  }

  try {
    const decrypted = await decryptPayload(encryptedPayload);
    updateMemoryCache(decrypted, now);

    return decrypted;
  } catch (e) {
    logger.error({
      message: "failed to decrypt license payload",
      error: e,
    });
    console.log(e);

    return EMPTY_LICENSE_RESPONSE;
  }
}

function updateMemoryCache(
  payload: ICheckLicenseDecryptedPayload | IApiErrorResponse,
  now: number,
): void {
  const expiresAt = now + 60 * 60 * 1000;
  memoryCache = {
    payload,
    expiresAt,
  };
}

async function pingLicenseServer(): Promise<
  ICheckLicenseResponseBody | IApiErrorResponse
> {
  const requestBody: ICheckLicenseRequestBody = {
    license_key: config.licenseKey,
    // machine_signature: config.machineSignature,
    metadata: {
      version: config.version,
      deploymentProvider,
    },
    timestamp: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(`${config.licensePilotUrl}/v1/license/check`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `License server returned ${response.status}: ${response.statusText}`,
      );
    }

    return (await response.json()) as
      | ICheckLicenseResponseBody
      | IApiErrorResponse;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function decryptPayload(
  encryptedPayload: string,
): Promise<ICheckLicenseDecryptedPayload> {
  if (!config.licenseSignature) {
    throw new Error("License signature not configured");
  }

  const decoded = jwt.verify(
    encryptedPayload,
    config.licenseSignature,
  ) as ICheckLicenseDecryptedPayload;

  // todo: check is jwt is expired
  if (decoded.license_key !== config.licenseKey) {
    try {
      await clearCache();
    } catch (_) {}

    throw new Error(
      "License key mismatch: payload does not match requesting license",
    );
  }

  return decoded;
}

function getDeploymentProvider() {
  if (process.env.VERCEL) {
    return "vercel";
  } else if (process.env.RENDER) {
    return "render";
  } else if (process.env.RAILWAY_SERVICE_ID) {
    return "railway";
  } else {
    return "unknown";
  }
}

async function clearCache() {
  memoryCache = EMPTY_MEMORY_CACHE;

  if (cache.isActive) {
    try {
      await cache.valkey.del(getLogChimpCacheKey(config.licenseKey));
    } catch (e) {
      logger.error({
        message: "error deleting invalid cached license payload",
        error: e,
      });
    }
  }
}
