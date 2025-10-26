import type {
  ICheckLicenseDecryptedPayload,
  ICheckLicenseRequestBody,
  ICheckLicenseResponseBody,
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
  response_nonce: "",
  server_time: "",
};

// In-memory cache for ultra-fast access
let memoryCache: {
  payload: ICheckLicenseDecryptedPayload | null;
  expiresAt: number;
} = {
  payload: null,
  expiresAt: 0,
};

// Prevent multiple simultaneous license server requests
let pendingLicenseCheck: Promise<ICheckLicenseDecryptedPayload> | null = null;

export async function checkLicense(): Promise<ICheckLicenseDecryptedPayload> {
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
        const decrypted = decryptPayload(encryptedPayload);
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
      return EMPTY_LICENSE_RESPONSE;
    }

    encryptedPayload = data.encrypted_payload;
    const decrypted = decryptPayload(encryptedPayload);

    updateMemoryCache(decrypted, now);

    if (cache.isActive) {
      try {
        await cache.valkey.set(
          getLogChimpCacheKey(licenseKey),
          data.encrypted_payload,
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
    return decryptPayload(encryptedPayload);
  } catch (e) {
    logger.error({
      message: "failed to decrypt license payload",
      error: e,
    });

    if (cache.isActive) {
      try {
        await cache.valkey.del(getLogChimpCacheKey(licenseKey));
      } catch (e) {
        logger.error({
          message: "error deleting invalid cached license payload",
          error: e,
        });
      }
    }

    return EMPTY_LICENSE_RESPONSE;
  }
}

function updateMemoryCache(
  payload: ICheckLicenseDecryptedPayload,
  now: number,
): void {
  const expiresAt = now + 60 * 60 * 1000;
  memoryCache = {
    payload,
    expiresAt,
  };
}

async function pingLicenseServer() {
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

    return (await response.json()) as ICheckLicenseResponseBody;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

function deleteLicenseCache() {}

function decryptPayload(
  encryptedPayload: string,
): ICheckLicenseDecryptedPayload {
  return jwt.verify(
    encryptedPayload,
    config.licenseSignature,
  ) as ICheckLicenseDecryptedPayload;
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
