import * as cache from "../cache";
import { CACHE_KEYS } from "../cache/keys";
import type { ISiteSettings } from "@logchimp/types";
import logger from "../utils/logger";
import database from "../database";
import { DAY } from "../cache/time";

export class workspaceRepository {
  async GetSettings() {
    if (cache.isActive) {
      try {
        const cached = await cache.valkey.get(CACHE_KEYS.SITE_SETTINGS);
        if (cached) {
          return JSON.parse(cached) as ISiteSettings;
        }
      } catch (err) {
        logger.error({ message: err });
      }
    }

    try {
      const settings = await database("settings")
        .select<ISiteSettings>("*", database.raw("labs::json as labs"))
        .first();

      if (cache.isActive) {
        try {
          await cache.valkey.set(
            CACHE_KEYS.SITE_SETTINGS,
            JSON.stringify(settings),
            "EX",
            7 * DAY,
          );
        } catch (err) {
          logger.error({ message: err });
        }
      }

      return settings;
    } catch (err) {
      throw err;
    }
  }
}
