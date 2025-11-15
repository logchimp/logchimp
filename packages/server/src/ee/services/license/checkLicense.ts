import type {
  ILicenseServiceResponse,
  ICheckLicenseDecryptedPayload,
  ICheckLicenseRequestBody,
  ICheckLicenseResponseBody,
  IApiErrorResponse,
  TLicenseSubscriptionType,
  TDeploymentProvider,
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

const EMPTY_LICENSE_RESPONSE: ILicenseServiceResponse = {
  status: "",
  license_key: "",
  response_nonce: "",
  server_time: "",
  subscription_type: "free",
  hierarchy: 0,
};

// In-memory cache for ultra-fast access
interface IMemoryCache {
  payload: ILicenseServiceResponse | IApiErrorResponse | null;
  expiresAt: number;
}
const EMPTY_MEMORY_CACHE: IMemoryCache = {
  payload: null,
  expiresAt: 0,
};
let memoryCache: IMemoryCache = EMPTY_MEMORY_CACHE;

// Prevent multiple simultaneous license server requests
let pendingLicenseCheck: Promise<ILicenseServiceResponse> | null = null;

export async function checkLicense(): Promise<
  ILicenseServiceResponse | IApiErrorResponse
> {
  const licenseKey = config.licenseKey;
  if (!licenseKey) {
    logger.warn(
      "License key is not configured. Check your environment variables or 'logchimp.config.json' file.",
    );
    return EMPTY_LICENSE_RESPONSE;
  }
  if (!config.licenseSignature) {
    logger.warn(
      "License signature is not configured. Check your environment variables or 'logchimp.config.json' file.",
    );
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
): Promise<ILicenseServiceResponse> {
  let encryptedPayload: string | null = null;
  if (cache.isActive) {
    try {
      encryptedPayload = await cache.valkey.get(
        getLogChimpCacheKey(licenseKey),
      );
      if (encryptedPayload) {
        const decrypted = await decryptPayload(encryptedPayload);

        const response = {
          ...decrypted,
          hierarchy: getSubscriptionTypeHierarchy(decrypted.subscription_type),
        } satisfies ILicenseServiceResponse;
        updateMemoryCache(response, now);
        return response;
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

    const response = {
      ...decrypted,
      hierarchy: getSubscriptionTypeHierarchy(decrypted.subscription_type),
    } satisfies ILicenseServiceResponse;
    updateMemoryCache(response, now);
    return response;
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
  payload: ILicenseServiceResponse | IApiErrorResponse,
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
      headers: {
        "Content-Type": "application/json",
      },
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

function getDeploymentProvider(): TDeploymentProvider {
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

function getSubscriptionTypeHierarchy(
  subscriptionType: TLicenseSubscriptionType,
): number {
  switch (subscriptionType) {
    case "free":
      return 0;
    case "starter":
      return 1;
    case "growth":
      return 2;
    case "enterprise":
      return 3;
    default:
      return 0;
  }
}
