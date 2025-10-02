import type {
  ICheckLicenseRequestBody,
  ICheckLicenseResponseBody,
} from "@logchimp/types";

import { configManager } from "../../../utils/logchimpConfig";
import * as cache from "../../../cache";
import { LOGCHIMP_LICENSE_CACHE_TTL_IN_SECONDS } from "../../../constants";

const config = configManager.getConfig();

const getLogChimpCacheKey = (licenseKey: string) =>
  `${config.cachePrefix}pilot:key:${licenseKey}`;

export async function checkLicense(): Promise<boolean> {
  const licenseKey = config.licenseKey;
  if (!licenseKey) {
    // Invalid or missing license key in your environment variables or logchimp.config.json file
    return false;
  }

  // let cachedData: unknown;
  if (cache.isActive) {
    const cachedData = await cache.valkey.get(getLogChimpCacheKey(licenseKey));
    if (cachedData) {
      return (JSON.parse(cachedData) as ICheckLicenseResponseBody).status;
    }
  }

  const response = await fetch(`${config.licensePilotUrl}/license/check`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      license_key: licenseKey,
      machine_signature: config.machineSignature,
      timestamp: new Date().toISOString(),
    } as ICheckLicenseRequestBody),
  });
  const data = (await response.json()) as ICheckLicenseResponseBody;
  if (cache.isActive) {
    await cache.valkey.set(
      getLogChimpCacheKey(licenseKey),
      JSON.stringify(data),
      "EX",
      LOGCHIMP_LICENSE_CACHE_TTL_IN_SECONDS,
    );
  }
  return data.status;
}
