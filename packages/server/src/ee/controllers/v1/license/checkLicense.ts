import { configManager } from "../../../../utils/logchimpConfig";
import * as cache from "../../../../cache";

const config = configManager.getConfig();

const getLogChimpCacheKey = (licenseKey: string) =>
  `logchimp-pilot-lk-${licenseKey}`;

export async function checkLicense() {
  const licenseKey = config.licenseKey;
  if (!licenseKey) {
    // Invalid or missing license key in your environment variables or logchimp.config.json file
    return false;
  }

  // let cachedData: unknown;
  if (cache.isActive) {
    const cachedData = await cache.valkey.get(getLogChimpCacheKey(licenseKey));
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }

  // const response = await fetch(
  //   `${config.}`
  // )
}
