import type {
  ICheckLicenseDecryptedPayload,
  ICheckLicenseRequestBody,
  ICheckLicenseResponseBody,
} from "@logchimp/types";
import jwt from "jsonwebtoken";

import { configManager } from "../../../utils/logchimpConfig";
import * as cache from "../../../cache";
import { LOGCHIMP_LICENSE_CACHE_TTL_IN_SECONDS } from "../../../constants";
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

export async function checkLicense(): Promise<ICheckLicenseDecryptedPayload> {
  const licenseKey = config.licenseKey;
  if (!licenseKey) {
    return EMPTY_LICENSE_RESPONSE;
  }

  let encryptedPayload: string | null = null;
  if (cache.isActive) {
    try {
      encryptedPayload = await cache.valkey.get(
        getLogChimpCacheKey(licenseKey),
      );
    } catch (e) {
      logger.error({
        message: "error get license encrypted payload from cache",
        error: e,
      });
    }
  }

  if (!encryptedPayload) {
    try {
      const data = await pingLicenseServer();
      if ("code" in data || !data.encrypted_payload) {
        return EMPTY_LICENSE_RESPONSE;
      }

      encryptedPayload = data.encrypted_payload;

      if (cache.isActive) {
        try {
          await cache.valkey.set(
            getLogChimpCacheKey(licenseKey),
            data.encrypted_payload,
            "EX",
            LOGCHIMP_LICENSE_CACHE_TTL_IN_SECONDS,
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

async function pingLicenseServer() {
  const response = await fetch(`${config.licensePilotUrl}/v1/license/check`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      license_key: config.licenseKey,
      metadata: {
        version: config.version,
        deploymentProvider,
        // features_used
      },
      timestamp: new Date().toISOString(),
    } as ICheckLicenseRequestBody),
  });

  return (await response.json()) as ICheckLicenseResponseBody;
}

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
